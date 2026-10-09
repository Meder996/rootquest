"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Mail,
  Send,
  Trash2,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

interface ProfileUser {
  id: string;
  email: string;
  name: string;
  role: string;
  dailyGoal: number;
  satDate: string | null;
  timezone: string | null;
  emailVerified: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [name, setName] = useState("");
  const [dailyGoal, setDailyGoal] = useState("20");
  const [satDate, setSatDate] = useState("");
  const [timezone, setTimezone] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [verificationSent, setVerificationSent] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed"))))
      .then((data) => {
        setUser(data.user);
        setName(data.user.name);
        setDailyGoal(String(data.user.dailyGoal));
        setSatDate(data.user.satDate ?? "");
        setTimezone(data.user.timezone ?? "");
      });
  }, []);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileMessage("");
    setProfileError("");
    setIsSavingProfile(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          dailyGoal: Number(dailyGoal),
          satDate: satDate || null,
          timezone: timezone || null,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not save your profile.");
      setUser(body.user);
      setProfileMessage("Profile saved.");
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Could not save your profile.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordMessage("");
    setPasswordError("");
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    setIsSavingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not change your password.");
      setPasswordMessage("Password changed. You stay signed in on this device.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Could not change your password.");
    } finally {
      setIsSavingPassword(false);
    }
  }

  async function resendVerification() {
    setIsResending(true);
    try {
      await fetch("/api/auth/resend-verification", { method: "POST" });
      setVerificationSent(true);
    } finally {
      setIsResending(false);
    }
  }

  async function deleteAccount() {
    setDeleteError("");
    if (deleteConfirmText !== "DELETE") {
      setDeleteError('Type DELETE in the confirmation box to continue.');
      return;
    }
    setIsDeleting(true);
    try {
      const res = await fetch("/api/profile/delete-account", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Could not delete your account.");
      }
      router.push("/auth/log-in?deleted=1");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Could not delete your account.");
      setIsDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-10">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-turquoise"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to dashboard
      </Link>

      <h1 className="font-display text-3xl font-extrabold">Profile &amp; Settings</h1>
      <p className="mt-1 text-muted">Manage your account, goals, and preferences.</p>

      {!user ? (
        <Spinner label="Loading your profile…" className="py-24" />
      ) : (
        <ProfilePageContent
          user={user}
          name={name}
          setName={setName}
          dailyGoal={dailyGoal}
          setDailyGoal={setDailyGoal}
          satDate={satDate}
          setSatDate={setSatDate}
          timezone={timezone}
          setTimezone={setTimezone}
          profileMessage={profileMessage}
          profileError={profileError}
          isSavingProfile={isSavingProfile}
          saveProfile={saveProfile}
          currentPassword={currentPassword}
          setCurrentPassword={setCurrentPassword}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          passwordMessage={passwordMessage}
          passwordError={passwordError}
          isSavingPassword={isSavingPassword}
          changePassword={changePassword}
          verificationSent={verificationSent}
          isResending={isResending}
          resendVerification={resendVerification}
          confirmDelete={confirmDelete}
          setConfirmDelete={setConfirmDelete}
          deleteConfirmText={deleteConfirmText}
          setDeleteConfirmText={setDeleteConfirmText}
          deleteError={deleteError}
          isDeleting={isDeleting}
          deleteAccount={deleteAccount}
        />
      )}
    </div>
  );
}

interface ProfilePageContentProps {
  user: ProfileUser;
  name: string;
  setName: (v: string) => void;
  dailyGoal: string;
  setDailyGoal: (v: string) => void;
  satDate: string;
  setSatDate: (v: string) => void;
  timezone: string;
  setTimezone: (v: string) => void;
  profileMessage: string;
  profileError: string;
  isSavingProfile: boolean;
  saveProfile: (event: FormEvent<HTMLFormElement>) => void;
  currentPassword: string;
  setCurrentPassword: (v: string) => void;
  newPassword: string;
  setNewPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  passwordMessage: string;
  passwordError: string;
  isSavingPassword: boolean;
  changePassword: (event: FormEvent<HTMLFormElement>) => void;
  verificationSent: boolean;
  isResending: boolean;
  resendVerification: () => void;
  confirmDelete: boolean;
  setConfirmDelete: (v: boolean) => void;
  deleteConfirmText: string;
  setDeleteConfirmText: (v: string) => void;
  deleteError: string;
  isDeleting: boolean;
  deleteAccount: () => void;
}

function ProfilePageContent({
  user,
  name,
  setName,
  dailyGoal,
  setDailyGoal,
  satDate,
  setSatDate,
  timezone,
  setTimezone,
  profileMessage,
  profileError,
  isSavingProfile,
  saveProfile,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  passwordMessage,
  passwordError,
  isSavingPassword,
  changePassword,
  verificationSent,
  isResending,
  resendVerification,
  confirmDelete,
  setConfirmDelete,
  deleteConfirmText,
  setDeleteConfirmText,
  deleteError,
  isDeleting,
  deleteAccount,
}: ProfilePageContentProps) {
  return (
    <>
      <div className="mt-6">

      {/* ------------------------------------------------------------ profile */}
      <Card className="mt-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
          <User className="h-5 w-5 text-violet" aria-hidden="true" />
          Profile
        </h2>
        <form onSubmit={saveProfile} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <div>
              <Input
                label="Email"
                type="email"
                value={user.email}
                disabled
                helperText="Email cannot be changed."
              />
            </div>
            <Input
              label="Daily goal (words)"
              type="number"
              min={1}
              max={500}
              value={dailyGoal}
              onChange={(e) => setDailyGoal(e.target.value)}
            />
            <Input
              label="SAT test date"
              type="date"
              value={satDate}
              onChange={(e) => setSatDate(e.target.value)}
            />
            <Select
              label="Timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            >
              <option value="">Use browser default</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern (America/New_York)</option>
              <option value="America/Chicago">Central (America/Chicago)</option>
              <option value="America/Denver">Mountain (America/Denver)</option>
              <option value="America/Los_Angeles">Pacific (America/Los_Angeles)</option>
              <option value="Europe/London">London (Europe/London)</option>
              <option value="Asia/Tokyo">Tokyo (Asia/Tokyo)</option>
            </Select>
            <div className="flex items-end">
              {user.emailVerified ? (
                <Badge tone="success">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Email verified
                </Badge>
              ) : (
                <div className="flex flex-col gap-2">
                  <Badge tone="yellow">
                    <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                    Email not verified
                  </Badge>
                  <button
                    type="button"
                    onClick={resendVerification}
                    disabled={isResending || verificationSent}
                    className="flex items-center gap-1.5 text-xs font-semibold text-turquoise hover:underline disabled:opacity-60"
                  >
                    <Send className="h-3.5 w-3.5" aria-hidden="true" />
                    {verificationSent ? "Verification email sent" : "Resend verification email"}
                  </button>
                </div>
              )}
            </div>
          </div>
          {profileError && (
            <p className="rounded-xl border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-coral">
              {profileError}
            </p>
          )}
          {profileMessage && (
            <p className="rounded-xl border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">
              {profileMessage}
            </p>
          )}
          <Button type="submit" isLoading={isSavingProfile} className="self-start">
            Save profile
          </Button>
        </form>
      </Card>

      {/* ---------------------------------------------------------- password */}
      <Card className="mt-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
          <KeyRound className="h-5 w-5 text-turquoise" aria-hidden="true" />
          Change password
        </h2>
        <form onSubmit={changePassword} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Current password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Input
              label="New password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              helperText="At least 8 characters."
            />
            <Input
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {passwordError && (
            <p className="rounded-xl border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-coral">
              {passwordError}
            </p>
          )}
          {passwordMessage && (
            <p className="rounded-xl border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">
              {passwordMessage}
            </p>
          )}
          <Button type="submit" variant="secondary" isLoading={isSavingPassword} className="self-start">
            Change password
          </Button>
        </form>
      </Card>

      {/* ------------------------------------------------------ danger zone */}
      <Card className="mt-6 border-coral/40">
        <h2 className="mb-2 flex items-center gap-2 font-display text-lg font-bold text-coral">
          <Trash2 className="h-5 w-5" aria-hidden="true" />
          Delete account
        </h2>
        <p className="text-sm text-muted">
          Permanently delete your account and all of your progress, saved words, quiz
          history, and achievements. This cannot be undone. See our{" "}
          <Link href="/privacy" className="text-turquoise hover:underline">
            privacy policy
          </Link>{" "}
          for details.
        </p>
        {!confirmDelete ? (
          <Button
            variant="ghost"
            className="mt-4 text-coral hover:bg-coral/10 hover:text-coral"
            onClick={() => setConfirmDelete(true)}
          >
            Delete my account
          </Button>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            <p className="text-sm font-semibold">
              Type <code className="rounded bg-surface px-1.5 py-0.5">DELETE</code> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              aria-label="Type DELETE to confirm account deletion"
              className="h-11 w-full max-w-xs rounded-xl border border-coral/50 bg-surface px-4 text-sm text-text placeholder:text-muted/60 focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/30"
            />
            {deleteError && <p className="text-sm text-coral">{deleteError}</p>}
            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="text-coral hover:bg-coral/10 hover:text-coral"
                onClick={deleteAccount}
                isLoading={isDeleting}
              >
                Permanently delete my account
              </Button>
              <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>
      </div>
    </>
  );
}
