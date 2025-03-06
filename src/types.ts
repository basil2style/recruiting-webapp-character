export type Attributes = {
    Strength: number;
    Dexterity: number;
    Constitution: number;
    Intelligence: number;
    Wisdom: number;
    Charisma: number;
};

export type Class = "Barbarian" | "Wizard" | "Bard";

export type Skills = {
  [skill: string]: number;
};

export type Character = {
  skills: Skills;
  // Other character properties can be added here
};
