import a1 from "@/assets/avatars/avatar-1.png";
import a2 from "@/assets/avatars/avatar-2.png";
import a3 from "@/assets/avatars/avatar-3.png";
import a4 from "@/assets/avatars/avatar-4.png";
import a5 from "@/assets/avatars/avatar-5.png";
import a6 from "@/assets/avatars/avatar-6.png";
import a7 from "@/assets/avatars/avatar-7.png";
import a8 from "@/assets/avatars/avatar-8.png";
import a9 from "@/assets/avatars/avatar-9.png";
import a10 from "@/assets/avatars/avatar-10.png";
import captain from "@/assets/avatars/captain.png";

export type AvatarOption = { id: string; src: string; label: string };

export const AVATARS: AvatarOption[] = [
  { id: "av-1", src: a1, label: "Recruta Bravo" },
  { id: "av-2", src: a2, label: "Recruta Aurora" },
  { id: "av-3", src: a3, label: "Recruta Tito" },
  { id: "av-4", src: a4, label: "Recruta Iara" },
  { id: "av-5", src: a5, label: "Veterano Sá" },
  { id: "av-6", src: a6, label: "Veterana Helena" },
  { id: "av-7", src: a7, label: "Recruta Gael" },
  { id: "av-8", src: a8, label: "Recruta Lis" },
  { id: "av-9", src: a9, label: "Recruta Kenji" },
  { id: "av-10", src: a10, label: "Recruta Beatriz" },
];

export const CAPTAIN_AVATAR = captain;

export function getAvatarSrc(id?: string | null) {
  return AVATARS.find((a) => a.id === id)?.src ?? AVATARS[0].src;
}