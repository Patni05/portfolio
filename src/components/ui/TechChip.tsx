"use client";

import type { IconType } from "react-icons";
import {
  SiApachejmeter,
  SiBootstrap,
  SiC,
  SiCloudflare,
  SiCplusplus,
  SiCss3,
  SiDocker,
  SiExpress,
  SiFigma,
  SiFirebase,
  SiGit,
  SiGithub,
  SiGnubash,
  SiGooglemaps,
  SiHtml5,
  SiJavascript,
  SiJsonwebtokens,
  SiLinux,
  SiMongodb,
  SiMysql,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiPostman,
  SiPrisma,
  SiPython,
  SiPytorch,
  SiReact,
  SiSelenium,
  SiTailwindcss,
  SiTypescript,
  SiZod,
} from "react-icons/si";
import { VscVscode } from "react-icons/vsc";

/**
 * Brand icons, resolved by skill name. Anything without a real logo renders as
 * a plain text chip rather than a stand-in icon.
 */
const ICONS: Record<string, IconType> = {
  javascript: SiJavascript,
  typescript: SiTypescript,
  python: SiPython,
  "c++": SiCplusplus,
  c: SiC,
  "react.js": SiReact,
  react: SiReact,
  "react 19": SiReact,
  "next.js": SiNextdotjs,
  "next.js 15": SiNextdotjs,
  html: SiHtml5,
  css: SiCss3,
  "tailwind css": SiTailwindcss,
  bootstrap: SiBootstrap,
  "node.js": SiNodedotjs,
  "express.js": SiExpress,
  postgresql: SiPostgresql,
  mongodb: SiMongodb,
  mysql: SiMysql,
  "prisma orm": SiPrisma,
  prisma: SiPrisma,
  docker: SiDocker,
  linux: SiLinux,
  "cloudflare workers": SiCloudflare,
  "cloudflare tunnel": SiCloudflare,
  "durable objects": SiCloudflare,
  "bash scripting": SiGnubash,
  selenium: SiSelenium,
  "apache jmeter": SiApachejmeter,
  postman: SiPostman,
  pytorch: SiPytorch,
  git: SiGit,
  github: SiGithub,
  figma: SiFigma,
  "vs code": VscVscode,
  zod: SiZod,
  "firebase auth": SiFirebase,
  jwt: SiJsonwebtokens,
  "google maps api": SiGooglemaps,
};

type Props = {
  name: string;
  /** Compact variant used inside project cards. */
  small?: boolean;
};

export function TechChip({ name, small = false }: Props) {
  const Icon = ICONS[name.toLowerCase()];

  return (
    <span className={small ? "chip chip--sm" : "chip"}>
      {Icon ? <Icon aria-hidden="true" className="chip__icon" /> : null}
      {name}
    </span>
  );
}
