import React from 'react';
import { User } from 'firebase/auth';
import { LogOut } from 'lucide-react';

interface GoogleSignInButtonProps {
  user: User | null;
  isLoading: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  compact?: boolean;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  user,
  isLoading,
  onSignIn,
  onSignOut,
  compact = false,
}) => {
  if (user) {
    return (
      <div className="flex items-center gap-2.5 p-1.5 pl-2.5 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl border border-zinc-200 dark:border-zinc-700/80">
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="w-7 h-7 rounded-full border border-purple-300 dark:border-purple-600 object-cover"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-purple-500 text-white font-bold text-xs flex items-center justify-center">
            {(user.displayName || user.email || 'U')[0].toUpperCase()}
          </div>
        )}
        <div className="text-left hidden sm:block max-w-[140px] truncate">
          <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
            {user.displayName || 'Google User'}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Calendar Connected
          </div>
        </div>
        <button
          onClick={onSignOut}
          title="Sign out of Google"
          className="p-1.5 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onSignIn}
      disabled={isLoading}
      type="button"
      className="inline-flex items-center justify-center gap-2.5 px-4 py-2 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs sm:text-sm font-semibold rounded-2xl border border-zinc-300 dark:border-zinc-700 shadow-xs hover:shadow-md transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          className="w-4 h-4 sm:w-5 sm:h-5 shrink-0"
        >
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
          />
          <path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
          />
        </svg>
      )}
      <span>{compact ? 'Google Sync' : 'Sign in with Google'}</span>
    </button>
  );
};
