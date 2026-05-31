import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import { dbService } from "../lib/supabase";
import md5 from "md5";
import {
  User,
  Mail,
  Trophy,
  LogOut,
  Download,
  FileSpreadsheet,
  Settings,
  ArrowRight,
  HeartHandshake,
  Database,
  Edit2,
  Check,
  X,
  Lock,
  Camera
} from "lucide-react";

export const ProfileTab: React.FC = () => {
  const {
    user,
    games,
    signOut,
    addToast,
    updateUserProfile,
    updateUserCredentials,
  } = useApp();
  const [selectedGameToExport, setSelectedGameToExport] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Custom Avatar Upload
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && !isEditing) {
      setEditUsername(user.username || "");
      setEditEmail(user.email || "");
      setEditPassword("");
    }
  }, [user, isEditing]);

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const processAndUploadImage = (file: File) => {
    setIsUploadingAvatar(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 250;
        const MAX_HEIGHT = 250;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
             ctx.drawImage(img, 0, 0, width, height);
             canvas.toBlob(async (blob) => {
               if (blob) {
                 const formData = new FormData();
                 formData.append("avatar", blob, file.name);

                 try {
                   const res = await fetch("/api/upload-avatar", {
                       method: "POST",
                       body: formData,
                   });

                   if (!res.ok) {
                     const errData = await res.json();
                     throw new Error(errData.error || "Failed to upload to CDN");
                   }

                   const data = await res.json();
                   
                   // Important: update local profile state via updateUserProfile to persist it right away
                   await updateUserProfile(editUsername || user?.username || '', data.url);
                   addToast("Profile picture updated", "success");
                 } catch (err: any) {
                   console.error(err);
                   addToast(err.message || "Could not upload image", "error");
                 } finally {
                   setIsUploadingAvatar(false);
                 }
               }
             }, "image/jpeg", 0.85); // 85% quality JPEG
        } else {
             setIsUploadingAvatar(false);
        }
      };
      img.onerror = () => {
        addToast("Invalid image file", "error");
        setIsUploadingAvatar(false);
      };
      if (e.target?.result) {
         img.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.startsWith("image/")) {
        addToast("Please select an image file", "error");
        return;
      }
      processAndUploadImage(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!editUsername.trim() || !editEmail.trim()) {
      addToast("Username and Email cannot be empty", "error");
      return;
    }
    setIsLoading(true);
    try {
      // Logic for fallback DP only if we aren't using a custom/uploaded avatar.
      const currentAvatar = user?.avatar_url || '';
      let nextAvatarUrl = currentAvatar;
      
      const emailHash = md5(editEmail.trim().toLowerCase());
      const gravatarUrl = `https://www.gravatar.com/avatar/${emailHash}?d=mp`;

      const isCustomAvater = currentAvatar.startsWith('http') && 
                             !currentAvatar.includes('gravatar.com') && 
                             !currentAvatar.includes('dicebear.com') && 
                             !currentAvatar.includes('googleusercontent.com');

      // If they changed their email, and don't have a custom uploaded avatar, fall back to Gravatar
      if (editEmail !== user?.email && !isCustomAvater) {
         nextAvatarUrl = gravatarUrl;
      }

      await updateUserProfile(editUsername.trim(), nextAvatarUrl);

      // Update credentials
      await updateUserCredentials(
        editEmail !== user?.email ? editEmail.trim() : undefined,
        editPassword.trim() !== "" ? editPassword.trim() : undefined,
      );

      setIsEditing(false);
      addToast("Profile updated successfully!", "success");
    } catch (err: any) {
      addToast(err.message || "Failed to save profile", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const currentDp =
    user?.avatar_url &&
    !user?.avatar_url.includes("dicebear") &&
    !user?.avatar_url.includes("googleusercontent")
      ? user.avatar_url
      : user?.email
        ? `https://www.gravatar.com/avatar/${md5((user.email as string).trim().toLowerCase())}?d=mp`
        : `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.id || "profile"}`;

  const handleExportCSV = async () => {
    const targetGameId =
      selectedGameToExport || (games.length > 0 ? games[0].id : null);
    if (!targetGameId) {
      addToast(
        "Create some games prior to exporting leaderboard reports",
        "error",
      );
      return;
    }

    setIsExporting(true);
    try {
      const targetGame = games.find((g) => g.id === targetGameId);
      const players = await dbService.players.fetchAllForGame(targetGameId);

      if (players.length === 0) {
        addToast(
          `No scores logged for game "${targetGame?.title || "Unknown"}"`,
          "info",
        );
        setIsExporting(false);
        return;
      }

      // Generate CSV string content
      const headers = [
        "Rank",
        "Player Username",
        "Wins/Score",
        "Created Timestamp",
      ];
      const rows = players.map((p, index) => [
        index + 1,
        `@${p.username}`,
        p.wins,
        new Date(p.created_at).toLocaleString(),
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);

      const fileName = `LIVEReport_${targetGame?.title.replace(/\s+/g, "_") || "Game"}_${new Date().toISOString().slice(0, 10)}.csv`;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);

      link.click();
      document.body.removeChild(link);

      addToast("Leaderboard exported to CSV!", "success");
    } catch (err) {
      addToast("CSV Generation triggered a local error", "error");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-6 text-left select-none">
      {/* HEADER SECTION */}
      <div>
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">
          Host Profile
        </h2>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          Manage your host settings, display styles, and reports
        </p>
      </div>

      {/* USER INFORMATION CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-5 shadow-sm space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative isolate group">
              <img
                id="profile-avatar-large"
                src={currentDp}
                onClick={handleAvatarClick}
                alt="Profile Avatar"
                className={`w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 dark:border-slate-800 shrink-0 object-cover ${isEditing ? "cursor-pointer group-hover:opacity-50" : ""} transition-opacity`}
                referrerPolicy="no-referrer"
              />
              {isEditing && (
                 <div onClick={handleAvatarClick} className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity">
                    {isUploadingAvatar ? (
                       <div className="w-5 h-5 rounded-full border-2 border-rose-500 border-t-transparent animate-spin"></div>
                    ) : (
                       <Camera className="text-white drop-shadow-md opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                    )}
                 </div>
              )}
              {isEditing && (
                <input 
                  type="file" 
                  accept="image/jpeg, image/png, image/webp, image/gif" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              )}
            </div>
            {!isEditing ? (
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                  {user?.username || "GamerHost"}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1.5 mt-1">
                  <Mail size={13} />
                  <span className="truncate">
                    {user?.email || "host@stream.com"}
                  </span>
                </p>
              </div>
            ) : (
              <div className="flex-1 space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    TikTok ID / Username
                  </label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none focus:border-rose-500"
                  />
                  <p className="text-[9px] text-slate-400 mt-1">
                    DP will auto-update if email is linked to Gravatar.
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    New Password{" "}
                    <span className="text-slate-400 lowercase normal-case font-normal">
                      (Leave blank to keep)
                    </span>
                  </label>
                  <input
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              if (isEditing) {
                handleSaveProfile();
              } else {
                setIsEditing(true);
              }
            }}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-rose-500 transition-colors ml-2 mt-1"
          >
            {isEditing ? <Check size={16} /> : <Edit2 size={16} />}
          </button>

          {isEditing && (
            <button
              onClick={() => setIsEditing(false)}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-rose-500 transition-colors ml-2 mt-1"
            >
              <X size={16} />
            </button>
          )}
        </div>


      </div>

      {/* CSV EXPORTER CONTAINER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500">
            <FileSpreadsheet size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Session Leaderboard Export
            </h4>
            <p className="text-[10px] text-slate-400">
              Export scores to CSV file format
            </p>
          </div>
        </div>

        {games.length === 0 ? (
          <p className="text-[11px] text-slate-400 font-medium">
            No games started to generate exports yet.
          </p>
        ) : (
          <div className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Select game to export
              </label>
              <select
                id="export-game-selector"
                value={selectedGameToExport}
                onChange={(e) => setSelectedGameToExport(e.target.value)}
                className="w-full px-3.5 py-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none font-medium"
              >
                <option value="">-- Latest Active Game --</option>
                {games.map((game) => (
                  <option
                    id={`export-game-opt-${game.id}`}
                    key={game.id}
                    value={game.id}
                  >
                    {game.title} ({game.game_type})
                  </option>
                ))}
              </select>
            </div>

            <button
              id="profile-export-csv"
              type="button"
              onClick={handleExportCSV}
              disabled={isExporting}
              className="w-full py-3 bg-white dark:bg-slate-950 text-xs font-bold text-emerald-500 hover:bg-emerald-500 hover:text-white border border-slate-200 dark:border-slate-800 duration-150 rounded-xl flex items-center justify-center gap-2 focus:outline-none disabled:opacity-50"
            >
              <Download size={14} />
              <span>
                {isExporting
                  ? "Compiling Excel Report..."
                  : "Download Leaderboard CSV"}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* LOG OUT ACTION */}
      <button
        id="profile-logout-btn"
        onClick={signOut}
        className="w-full py-3.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-rose-500 hover:bg-rose-500 hover:border-rose-500 hover:text-white text-xs font-bold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 focus:outline-none shadow-sm"
      >
        <LogOut size={14} />
        <span>Log Out Streamer Session</span>
      </button>
    </div>
  );
};
