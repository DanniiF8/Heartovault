"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { AVATARS, avatarSrc } from "../avatars";

const gold = "#e7b457";
const muted = "#94a3b8";

// Para fechar o login (por exemplo se os custos subirem): no Vercel põe NEXT_PUBLIC_ENABLE_LOGIN=false e faz redeploy
const LOGIN_ENABLED = process.env.NEXT_PUBLIC_ENABLE_LOGIN !== "false";

export default function ProfileClient() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0].id);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    supabase
      .from("profiles")
      .select("username, avatar")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled || !data) return;
        setUsername(data.username ?? "");
        setAvatar(data.avatar ?? AVATARS[0].id);
      });
    return () => {
      cancelled = true;
    };
  }, [session]);

  async function signInWithGoogle() {
    setMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/profile` },
    });
    if (error) setMessage(`Could not start the sign in: ${error.message}`);
  }

  async function save() {
    if (!session) return;
    const name = username.trim();
    if (!/^[A-Za-z0-9_]{3,20}$/.test(name)) {
      setMessage("Username: 3 to 20 characters, only letters, numbers and _.");
      return;
    }
    setSaving(true);
    setMessage("");
    const { error } = await supabase.from("profiles").upsert({ id: session.user.id, username: name, avatar });
    setSaving(false);
    if (error) {
      setMessage(error.code === "23505" ? "That username is already taken." : `Could not save: ${error.message}`);
    } else {
      setMessage("Saved!");
    }
  }

  if (!ready) return <p style={{ color: muted }}>Loading…</p>;

  if (!session) {
    if (!LOGIN_ENABLED) {
      return (
        <p style={{ color: "#e8f4ff", maxWidth: 460 }}>
          Accounts are temporarily closed. Your progress is kept on this device and nothing is lost.
        </p>
      );
    }
    return (
      <div style={{ maxWidth: 380 }}>
        <p style={{ color: "#e8f4ff" }}>
          Sign in with your Google account to save your profile and your progress. No password needed.
        </p>
        <button type="button" onClick={signInWithGoogle} style={primaryBtn}>
          Continue with Google
        </button>
        {message && <p style={{ color: muted, marginTop: 12 }}>{message}</p>}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <img
          src={avatarSrc(avatar)}
          alt=""
          width={96}
          height={96}
          style={{ borderRadius: "50%", border: `2px solid ${gold}`, objectFit: "cover" }}
        />
        <div>
          <div style={{ color: gold, fontWeight: 700, fontSize: "1.2rem" }}>{username || "Choose a username"}</div>
          <div style={{ color: muted, fontSize: "0.85rem" }}>{session.user.email}</div>
        </div>
      </div>

      <label style={{ color: muted, fontSize: "0.85rem" }} htmlFor="username">
        Username
      </label>
      <input
        id="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        maxLength={20}
        style={{
          display: "block",
          width: "100%",
          maxWidth: 320,
          padding: "10px 14px",
          borderRadius: 999,
          border: "1px solid rgba(231,180,87,0.4)",
          background: "#021432",
          color: "#e8f4ff",
          margin: "4px 0 18px",
        }}
      />

      <div style={{ color: muted, fontSize: "0.85rem", marginBottom: 8 }}>Avatar</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))", gap: 8, marginBottom: 20 }}>
        {AVATARS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setAvatar(a.id)}
            title={a.label}
            aria-pressed={avatar === a.id}
            style={{
              padding: 0,
              borderRadius: 12,
              overflow: "hidden",
              cursor: "pointer",
              background: "transparent",
              border: avatar === a.id ? `3px solid ${gold}` : "3px solid transparent",
            }}
          >
            <img src={`/avatars/${a.id}.webp`} alt={a.label} width={72} height={72} style={{ display: "block", width: "100%", height: "auto" }} />
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button type="button" onClick={save} disabled={saving} style={primaryBtn}>
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          style={{ ...primaryBtn, background: "transparent", color: gold }}
        >
          Sign out
        </button>
      </div>
      {message && <p style={{ color: muted, marginTop: 12 }}>{message}</p>}
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  border: "1px solid rgba(231,180,87,0.6)",
  background: gold,
  color: "#021432",
  borderRadius: 999,
  padding: "8px 20px",
  fontWeight: 600,
  cursor: "pointer",
};
