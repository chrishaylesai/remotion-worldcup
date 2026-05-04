import { z } from "zod";
import masterData from "../../public/master.json";

export const WORLD_CUP_FPS = 30;
export const TITLE_SCENE_FRAMES = 180;
export const TEAM_SCENE_FRAMES = 240;
export const OVERVIEW_SCENE_FRAMES = 480;
export const TEAM_COUNT = 4;
export const WORLD_CUP_TOTAL_FRAMES =
  TITLE_SCENE_FRAMES + TEAM_SCENE_FRAMES * TEAM_COUNT + OVERVIEW_SCENE_FRAMES;

export const worldCupGroupVideoSchema = z.object({
  groupId: z.string(),
  format: z.enum(["landscape", "vertical"]),
});

export type WorldCupGroupVideoProps = z.infer<typeof worldCupGroupVideoSchema>;
export type RenderFormat = WorldCupGroupVideoProps["format"];

export type TeamCardData = {
  name: string;
  key: string;
  flagPath: string;
  fifaRanking: number;
  recentForm: string;
  headCoach: string;
  fact: string;
  confederation: string;
  qualification: QualificationData;
};

export type QualificationData = Record<string, number>;

export type FixtureData = {
  match: string;
  timePt: string;
};

export type FixtureDayData = {
  date: string;
  fixtures: FixtureData[];
};

export type GroupVideoData = {
  groupId: string;
  groupLabel: string;
  tournamentTitle: string;
  teams: TeamCardData[];
  fixtures: FixtureDayData[];
};

type RawFixture = {
  match: string;
  time_pt: string;
  venue?: string;
};

type RawTeamData = {
  flag: string;
  fifa_ranking: number;
  recentForm: string;
  head_coach: string;
  fact: string;
  confederation: string;
  qualification: QualificationData;
};

type RawGroupData = {
  fixtures: Record<string, RawFixture[]>;
  teams: string[];
  [key: string]: unknown;
};

type RawWorldCupData = {
  groups: Record<string, RawGroupData>;
};

const rawWorldCupData = masterData as RawWorldCupData;
const VALID_GROUP_IDS = Object.keys(rawWorldCupData.groups).sort();

export const getVideoDimensions = (format: RenderFormat) => {
  if (format === "vertical") {
    return {
      width: 1080,
      height: 1920,
    };
  }

  return {
    width: 1920,
    height: 1080,
  };
};

export const getValidGroupIds = () => {
  return VALID_GROUP_IDS;
};

export const getGroupVideoData = (groupId: string): GroupVideoData => {
  const group = rawWorldCupData.groups[groupId];

  if (!group) {
    throw new Error(
      `Invalid groupId "${groupId}". Expected one of: ${VALID_GROUP_IDS.join(", ")}`,
    );
  }

  if (group.teams.length !== TEAM_COUNT) {
    throw new Error(
      `Group "${groupId}" must contain exactly ${TEAM_COUNT} teams, received ${group.teams.length}.`,
    );
  }

  const teams = group.teams.map((teamName) => {
    const teamKey = teamName.toLowerCase();
    const teamData = group[teamKey];

    if (!isRawTeamData(teamData)) {
      throw new Error(
        `Missing or invalid team data for "${teamName}" in group "${groupId}".`,
      );
    }

    const flagPath = normalizeFlagPath(teamData.flag);

    if (!flagPath.startsWith("flags/")) {
      throw new Error(
        `Flag path "${teamData.flag}" for "${teamName}" must resolve inside public/flags.`,
      );
    }

    return {
      name: teamName,
      key: teamKey,
      flagPath,
      fifaRanking: teamData.fifa_ranking,
      recentForm: teamData.recentForm,
      headCoach: teamData.head_coach,
      fact: teamData.fact,
      confederation: teamData.confederation,
      qualification: teamData.qualification,
    };
  });

  const fixtures = Object.entries(group.fixtures).map(([date, matches]) => {
    return {
      date,
      fixtures: matches.map((fixture) => ({
        match: fixture.match,
        timePt: fixture.time_pt,
      })),
    };
  });

  return {
    groupId,
    groupLabel: formatGroupLabel(groupId),
    tournamentTitle: "World Cup 2026",
    teams,
    fixtures,
  };
};

const isRawTeamData = (value: unknown): value is RawTeamData => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.flag === "string" &&
    typeof record.fifa_ranking === "number" &&
    typeof record.recentForm === "string" &&
    typeof record.head_coach === "string" &&
    typeof record.fact === "string" &&
    typeof record.confederation === "string" &&
    isQualificationData(record.qualification)
  );
};

const isQualificationData = (value: unknown): value is QualificationData => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const record = value as Record<string, unknown>;
  const values = Object.values(record);

  return (
    values.length === 0 ||
    (typeof record.p === "number" &&
      typeof record.w === "number" &&
      values.every((item) => typeof item === "number"))
  );
};

const normalizeFlagPath = (flagPath: string) => {
  return flagPath.replace(/^\.\//u, "").replace(/^public\//u, "");
};

const formatGroupLabel = (groupId: string) => {
  const groupSuffix = groupId.split("_")[1];

  if (!groupSuffix) {
    throw new Error(`Could not derive group label from "${groupId}".`);
  }

  return `Group ${groupSuffix.toUpperCase()}`;
};
