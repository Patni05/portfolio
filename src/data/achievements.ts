export type Achievement = {
  title: string;
  detail: string;
  icon: "award" | "shield";
};

export const achievements: Achievement[] = [
  {
    title: "Merit-Based Scholarship — ₹80,000",
    detail: "Awarded for outstanding performance in Class XII.",
    icon: "award",
  },
  {
    title: "Cyber Security Certification — FutureLearn",
    detail:
      "Foundational cybersecurity concepts and digital security practices.",
    icon: "shield",
  },
];
