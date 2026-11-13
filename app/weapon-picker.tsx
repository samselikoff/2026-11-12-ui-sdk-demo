import { RadialPicker } from "@/components/radial-picker/radial-picker-parts";
import {
  GrenadeIcon,
  KnifeIcon,
  MedkitIcon,
  PistolIcon,
  RifleIcon,
  ShotgunIcon,
  SmokeIcon,
  SniperIcon,
} from "./weapon-icons";
import "./weapon-picker.css";

const weapons = [
  { value: "rifle", label: "Rifle", icon: <RifleIcon /> },
  { value: "sniper", label: "Sniper", icon: <SniperIcon /> },
  { value: "shotgun", label: "Shotgun", icon: <ShotgunIcon /> },
  { value: "grenade", label: "Grenade", icon: <GrenadeIcon /> },
  { value: "smoke", label: "Smoke", icon: <SmokeIcon /> },
  { value: "medkit", label: "Medkit", icon: <MedkitIcon /> },
  { value: "knife", label: "Knife", icon: <KnifeIcon /> },
  { value: "pistol", label: "Pistol", icon: <PistolIcon /> },
];

export function WeaponPicker() {
  return <RadialPicker aria-label="Weapon" items={weapons} placeholder="Weapon" />;
}
