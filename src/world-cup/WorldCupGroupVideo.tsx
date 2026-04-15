import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  getGroupVideoData,
  OVERVIEW_SCENE_FRAMES,
  QualificationData,
  RenderFormat,
  TeamCardData,
  TITLE_SCENE_FRAMES,
  TEAM_SCENE_FRAMES,
  WORLD_CUP_TOTAL_FRAMES,
  WorldCupGroupVideoProps,
} from "./data";

const ACCENT_COLORS = ["#23c6f5", "#ffd166", "#f45d48", "#7ef7c9"];
const SURFACE = "rgba(8, 19, 38, 0.72)";
const PANEL_BORDER = "rgba(255, 255, 255, 0.14)";
const TEXT_PRIMARY = "#f7fbff";
const TEXT_MUTED = "rgba(231, 242, 255, 0.78)";
const TITLE_REVEAL_DELAY = 4;
const TITLE_CARD_REVEAL_DELAY = 18;
const TEAM_PANEL_REVEAL_DELAY = 10;
const TEAM_FLAG_REVEAL_DELAY = 18;
const OVERVIEW_TEAM_REVEAL_DELAY = 10;
const OVERVIEW_SCHEDULE_REVEAL_DELAY = 22;

type FormatTheme = {
  format: RenderFormat;
  paddingX: number;
  paddingY: number;
  displaySize: number;
  headingSize: number;
  bodySize: number;
  metaSize: number;
  microSize: number;
  sceneGap: number;
  panelGap: number;
  teamFlagWidth: number;
  teamFlagHeight: number;
  summaryFlagWidth: number;
  summaryFlagHeight: number;
};

export const WorldCupGroupVideo: React.FC<WorldCupGroupVideoProps> = ({
  groupId,
  format,
}) => {
  const data = getGroupVideoData(groupId);
  const theme = getFormatTheme(format);

  return (
    <AbsoluteFill style={backgroundStyle}>
      <BackgroundDecor format={format} />
      <Sequence durationInFrames={TITLE_SCENE_FRAMES}>
        <TitleScene data={data} theme={theme} />
      </Sequence>
      {data.teams.map((team, index) => (
        <Sequence
          key={team.key}
          from={TITLE_SCENE_FRAMES + index * TEAM_SCENE_FRAMES}
          durationInFrames={TEAM_SCENE_FRAMES}
        >
          <TeamScene
            team={team}
            teamIndex={index}
            groupLabel={data.groupLabel}
            theme={theme}
          />
        </Sequence>
      ))}
      <Sequence
        from={WORLD_CUP_TOTAL_FRAMES - OVERVIEW_SCENE_FRAMES}
        durationInFrames={OVERVIEW_SCENE_FRAMES}
      >
        <OverviewScene data={data} theme={theme} />
      </Sequence>
    </AbsoluteFill>
  );
};

const TitleScene: React.FC<{
  data: ReturnType<typeof getGroupVideoData>;
  theme: FormatTheme;
}> = ({ data, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reveal = spring({
    fps,
    frame: frame - TITLE_REVEAL_DELAY,
    config: {
      damping: 14,
      mass: 1.1,
    },
  });
  const cardReveal = spring({
    fps,
    frame: frame - TITLE_CARD_REVEAL_DELAY,
    config: {
      damping: 14,
      mass: 1.1,
    },
  });

  return (
    <SceneShell
      theme={theme}
      accentColor={ACCENT_COLORS[0]}
      eyebrow={data.tournamentTitle}
      title={data.groupLabel.toUpperCase()}
      subtitle="Rankings, head coaches, and fixtures for the full group draw."
      showTitle={false}
    >
      <div
        style={{
          ...stackStyle(theme.sceneGap),
          marginTop: theme.format === "vertical" ? 48 : 12,
          transform: `translateY(${interpolate(reveal, [0, 1], [70, 0])}px)`,
          opacity: reveal,
        }}
      >
        <div
          style={{
            ...heroCardStyle(theme),
            minHeight: theme.format === "vertical" ? 460 : 280,
          }}
        >
          <div style={stackStyle(18)}>
            <div style={heroLabelStyle(theme)}>Tournament Preview Package</div>
            <div
              style={{
                fontFamily: DISPLAY_FONT,
                fontSize: theme.displaySize,
                lineHeight: 0.9,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: TEXT_PRIMARY,
              }}
            >
              {data.groupLabel}
            </div>
            <div
              style={{
                fontFamily: BODY_FONT,
                fontSize: theme.bodySize,
                lineHeight: 1.45,
                maxWidth: theme.format === "vertical" ? "100%" : 880,
                color: TEXT_MUTED,
              }}
            >
              Four nations. Six decisive fixtures. One fast read on the group.
            </div>
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              theme.format === "vertical" ? "1fr 1fr" : "repeat(4, minmax(0, 1fr))",
            gap: theme.panelGap,
            transform: `translateY(${interpolate(cardReveal, [0, 1], [48, 0])}px)`,
            opacity: cardReveal,
          }}
        >
          {data.teams.map((team, index) => (
            <SummaryCard
              key={team.key}
              team={team}
              accentColor={ACCENT_COLORS[index % ACCENT_COLORS.length]}
              theme={theme}
            />
          ))}
        </div>
      </div>
    </SceneShell>
  );
};

const TeamScene: React.FC<{
  team: TeamCardData;
  teamIndex: number;
  groupLabel: string;
  theme: FormatTheme;
}> = ({ team, teamIndex, groupLabel, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reveal = spring({
    fps,
    frame: frame - TEAM_PANEL_REVEAL_DELAY,
    config: {
      damping: 12,
      mass: 1.2,
    },
  });
  const flagReveal = spring({
    fps,
    frame: frame - TEAM_FLAG_REVEAL_DELAY,
    config: {
      damping: 12,
      mass: 1.15,
    },
  });
  const accentColor = ACCENT_COLORS[teamIndex % ACCENT_COLORS.length];
  const reverseRow = theme.format === "landscape" && teamIndex % 2 === 1;

  return (
    <SceneShell
      theme={theme}
      accentColor={accentColor}
      eyebrow={`${groupLabel.toUpperCase()} TEAM SPOTLIGHT`}
      title={team.name}
      subtitle="Current FIFA ranking and head coach."
    >
      <div
        style={{
          display: "flex",
          flexDirection:
            theme.format === "vertical"
              ? "column"
              : reverseRow
                ? "row-reverse"
                : "row",
          gap: theme.panelGap,
          alignItems: "stretch",
          justifyContent: "space-between",
          flex: 1,
          marginTop: theme.format === "vertical" ? 48 : 24,
        }}
      >
        <div
          style={{
            ...flagStageStyle(theme, accentColor),
            transform: `translateX(${interpolate(flagReveal, [0, 1], [
              reverseRow ? -60 : 60,
              0,
            ])}px) scale(${interpolate(flagReveal, [0, 1], [0.92, 1])})`,
            opacity: flagReveal,
          }}
        >
          <Img
            src={staticFile(team.flagPath)}
            style={{
              width: theme.teamFlagWidth,
              height: theme.teamFlagHeight,
              objectFit: "contain",
              borderRadius: 28,
              boxShadow: `0 24px 60px ${withAlpha(accentColor, 0.24)}`,
            }}
          />
        </div>
        <div
          style={{
            ...infoPanelStyle(theme),
            transform: `translateX(${interpolate(reveal, [0, 1], [
              reverseRow ? 70 : -70,
              0,
            ])}px)`,
            opacity: reveal,
          }}
        >
          <div style={stackStyle(theme.panelGap)}>
            <InfoPill label="FIFA Ranking" value={`#${team.fifaRanking}`} />
            <InfoPill label="Head Coach" value={team.headCoach} />
          </div>
          <div style={dividerStyle(accentColor)} />
          <QualificationSummary
            qualification={team.qualification}
            accentColor={accentColor}
            theme={theme}
          />
          <div style={dividerStyle(accentColor)} />
          <div
            style={{
              ...stackStyle(12),
              color: TEXT_MUTED,
              fontFamily: BODY_FONT,
              fontSize: theme.metaSize,
              lineHeight: 1.5,
            }}
          >
            <div>Confederation: {team.confederation}</div>
            <div
              style={{
                color: TEXT_PRIMARY,
                fontWeight: 700,
              }}
            >
              {team.fact}
            </div>
          </div>
        </div>
      </div>
    </SceneShell>
  );
};

const QualificationSummary: React.FC<{
  qualification: QualificationData;
  accentColor: string;
  theme: FormatTheme;
}> = ({ qualification, accentColor, theme }) => {
  const qualificationEntries = Object.entries(qualification);

  if (qualificationEntries.length === 0) {
    return (
      <div style={hostQualificationStyle(theme, accentColor)}>
        Pre-qualified as host.
      </div>
    );
  }

  const gamesPlayed = qualification.p;
  const wins = qualification.w;
  const winPercentage =
    gamesPlayed > 0 ? ((wins / gamesPlayed) * 100).toFixed(2) : "0.00";
  const columns = [...qualificationEntries, ["win %age", winPercentage] as const];

  return (
    <div style={qualificationPanelStyle(theme)}>
      <div style={qualificationLabelStyle(theme, accentColor)}>
        Qualification
      </div>
      <div
        style={{
          ...qualificationTableStyle(theme),
          gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
        }}
      >
        {columns.map(([key]) => (
          <div key={`heading-${key}`} style={qualificationHeadingStyle(theme)}>
            {key.toUpperCase()}
          </div>
        ))}
        {columns.map(([key, value]) => (
          <div key={`value-${key}`} style={qualificationValueStyle(theme)}>
            {value}
          </div>
        ))}
      </div>
    </div>
  );
};

const OverviewScene: React.FC<{
  data: ReturnType<typeof getGroupVideoData>;
  theme: FormatTheme;
}> = ({ data, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reveal = spring({
    fps,
    frame: frame - OVERVIEW_TEAM_REVEAL_DELAY,
    config: {
      damping: 14,
      mass: 1.15,
    },
  });
  const scheduleReveal = spring({
    fps,
    frame: frame - OVERVIEW_SCHEDULE_REVEAL_DELAY,
    config: {
      damping: 14,
      mass: 1.15,
    },
  });

  return (
    <SceneShell
      theme={theme}
      accentColor={ACCENT_COLORS[1]}
      eyebrow={`${data.groupLabel.toUpperCase()} OVERVIEW`}
      title={`${data.groupLabel} Fixtures`}
      subtitle="Compact summary of all four nations and every scheduled match."
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            theme.format === "vertical" ? "1fr" : "minmax(0, 0.95fr) minmax(0, 1.25fr)",
          gap: theme.panelGap,
          flex: 1,
          marginTop: theme.format === "vertical" ? 40 : 20,
        }}
      >
        <div
          style={{
            ...overviewTeamGridStyle(theme),
            transform: `translateY(${interpolate(reveal, [0, 1], [48, 0])}px)`,
            opacity: reveal,
          }}
        >
          {data.teams.map((team, index) => (
            <SummaryCard
              key={team.key}
              team={team}
              accentColor={ACCENT_COLORS[index % ACCENT_COLORS.length]}
              theme={theme}
              compact
            />
          ))}
        </div>
        <div
          style={{
            ...schedulePanelStyle(theme),
            transform: `translateY(${interpolate(scheduleReveal, [0, 1], [60, 0])}px)`,
            opacity: scheduleReveal,
          }}
        >
          <div style={stackStyle(18)}>
            <div style={sectionHeaderStyle(theme)}>Schedule</div>
            <div style={stackStyle(theme.format === "vertical" ? 16 : 18)}>
              {data.fixtures.map((fixtureDay) => (
                <div key={fixtureDay.date} style={stackStyle(10)}>
                  <div
                    style={{
                      color: ACCENT_COLORS[1],
                      fontFamily: DISPLAY_FONT,
                      fontSize: theme.metaSize,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    {fixtureDay.date}
                  </div>
                  <div style={stackStyle(10)}>
                    {fixtureDay.fixtures.map((fixture) => (
                      <div key={`${fixtureDay.date}-${fixture.match}`} style={fixtureRowStyle(theme)}>
                        <div
                          style={{
                            flex: 1,
                            color: TEXT_PRIMARY,
                            fontFamily: BODY_FONT,
                            fontSize: theme.bodySize,
                            lineHeight: 1.25,
                          }}
                        >
                          {fixture.match}
                        </div>
                        <div
                          style={{
                            color: TEXT_MUTED,
                            fontFamily: DISPLAY_FONT,
                            fontSize: theme.metaSize,
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {fixture.timePt} PT
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SceneShell>
  );
};

const SceneShell: React.FC<{
  theme: FormatTheme;
  accentColor: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  showTitle?: boolean;
  children: React.ReactNode;
}> = ({
  theme,
  accentColor,
  eyebrow,
  title,
  subtitle,
  showTitle = true,
  children,
}) => {
  return (
    <AbsoluteFill
      style={{
        padding: `${theme.paddingY}px ${theme.paddingX}px`,
        color: TEXT_PRIMARY,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: theme.sceneGap,
          width: "100%",
          height: "100%",
        }}
      >
        <div style={stackStyle(14)}>
          <div style={eyebrowStyle(theme, accentColor)}>{eyebrow}</div>
          {showTitle ? (
            <div
              style={{
                fontFamily: DISPLAY_FONT,
                fontSize: theme.headingSize,
                letterSpacing: "0.03em",
                textTransform: "uppercase",
                lineHeight: 0.98,
              }}
            >
              {title}
            </div>
          ) : null}
          <div
            style={{
              maxWidth: theme.format === "vertical" ? "100%" : 820,
              color: TEXT_MUTED,
              fontFamily: BODY_FONT,
              fontSize: theme.bodySize,
              lineHeight: 1.45,
            }}
          >
            {subtitle}
          </div>
        </div>
        {children}
      </div>
    </AbsoluteFill>
  );
};

const SummaryCard: React.FC<{
  team: TeamCardData;
  accentColor: string;
  theme: FormatTheme;
  compact?: boolean;
}> = ({ team, accentColor, theme, compact = false }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: compact || theme.format === "vertical" ? "column" : "row",
        gap: compact ? 14 : 18,
        alignItems: compact || theme.format === "vertical" ? "flex-start" : "center",
        minHeight: compact ? undefined : theme.format === "vertical" ? 260 : 190,
        padding: compact ? 20 : 24,
        borderRadius: 30,
        border: `1px solid ${PANEL_BORDER}`,
        background: `linear-gradient(180deg, ${withAlpha(accentColor, 0.18)} 0%, rgba(8, 19, 38, 0.92) 100%)`,
        boxShadow: `0 24px 50px ${withAlpha("#020814", 0.35)}`,
      }}
    >
      <Img
        src={staticFile(team.flagPath)}
        style={{
          width: compact ? theme.summaryFlagWidth : theme.summaryFlagWidth + 12,
          height: compact ? theme.summaryFlagHeight : theme.summaryFlagHeight + 12,
          objectFit: "contain",
          borderRadius: 18,
        }}
      />
      <div style={stackStyle(10)}>
        <div
          style={{
            fontFamily: DISPLAY_FONT,
            fontSize: compact ? theme.bodySize : theme.bodySize + 2,
            lineHeight: 1,
            textTransform: "uppercase",
          }}
        >
          {team.name}
        </div>
        <div
          style={{
            color: TEXT_MUTED,
            fontFamily: BODY_FONT,
            fontSize: compact ? theme.metaSize : theme.bodySize - 2,
            lineHeight: 1.35,
          }}
        >
          FIFA Ranking #{team.fifaRanking}
        </div>
        <div
          style={{
            color: TEXT_MUTED,
            fontFamily: BODY_FONT,
            fontSize: compact ? theme.metaSize : theme.bodySize - 2,
            lineHeight: 1.35,
          }}
        >
          Head Coach: {team.headCoach}
        </div>
      </div>
    </div>
  );
};

const InfoPill: React.FC<{
  label: string;
  value: string;
}> = ({ label, value }) => {
  const valueFontSize =
    value.length > 24 ? 28 : value.length > 18 ? 34 : value.length > 12 ? 38 : 42;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "20px 22px",
        borderRadius: 24,
        border: `1px solid ${PANEL_BORDER}`,
        backgroundColor: "rgba(255, 255, 255, 0.04)",
      }}
    >
      <div
        style={{
          color: TEXT_MUTED,
          fontFamily: DISPLAY_FONT,
          fontSize: 18,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          color: TEXT_PRIMARY,
          fontFamily: DISPLAY_FONT,
          fontSize: valueFontSize,
          lineHeight: 1.05,
          textTransform: "uppercase",
        }}
      >
        {value}
      </div>
    </div>
  );
};

const BackgroundDecor: React.FC<{
  format: RenderFormat;
}> = ({ format }) => {
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 12% 16%, rgba(35, 198, 245, 0.22), transparent 30%), radial-gradient(circle at 85% 14%, rgba(244, 93, 72, 0.18), transparent 28%), linear-gradient(145deg, #041021 0%, #0a1e38 52%, #0f315d 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: format === "vertical" ? -220 : -120,
          right: format === "vertical" ? -280 : -180,
          width: format === "vertical" ? 760 : 620,
          height: format === "vertical" ? 760 : 620,
          borderRadius: "50%",
          background: "rgba(255, 209, 102, 0.12)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: format === "vertical" ? 280 : -140,
          left: format === "vertical" ? -180 : -120,
          width: format === "vertical" ? 560 : 420,
          height: format === "vertical" ? 560 : 420,
          borderRadius: "50%",
          background: "rgba(126, 247, 201, 0.08)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(transparent 0%, rgba(255, 255, 255, 0.04) 100%)",
          opacity: 0.4,
        }}
      />
    </>
  );
};

const getFormatTheme = (format: RenderFormat): FormatTheme => {
  if (format === "vertical") {
    return {
      format,
      paddingX: 56,
      paddingY: 76,
      displaySize: 140,
      headingSize: 64,
      bodySize: 28,
      metaSize: 20,
      microSize: 16,
      sceneGap: 28,
      panelGap: 22,
      teamFlagWidth: 360,
      teamFlagHeight: 260,
      summaryFlagWidth: 84,
      summaryFlagHeight: 60,
    };
  }

  return {
    format,
    paddingX: 80,
    paddingY: 72,
    displaySize: 208,
    headingSize: 82,
    bodySize: 32,
    metaSize: 24,
    microSize: 18,
    sceneGap: 28,
    panelGap: 24,
    teamFlagWidth: 480,
    teamFlagHeight: 340,
    summaryFlagWidth: 100,
    summaryFlagHeight: 70,
  };
};

const overviewTeamGridStyle = (theme: FormatTheme): React.CSSProperties => {
  return {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: theme.panelGap,
    alignContent: "start",
  };
};

const schedulePanelStyle = (theme: FormatTheme): React.CSSProperties => {
  return {
    padding: theme.format === "vertical" ? 24 : 28,
    borderRadius: 34,
    border: `1px solid ${PANEL_BORDER}`,
    background: `linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, ${SURFACE} 100%)`,
    boxShadow: "0 28px 80px rgba(0, 0, 0, 0.2)",
    overflow: "hidden",
  };
};

const fixtureRowStyle = (theme: FormatTheme): React.CSSProperties => {
  return {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 20,
    padding: theme.format === "vertical" ? "10px 0" : "12px 0",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
  };
};

const heroCardStyle = (theme: FormatTheme): React.CSSProperties => {
  return {
    padding: theme.format === "vertical" ? 28 : 36,
    borderRadius: 36,
    border: `1px solid ${PANEL_BORDER}`,
    background:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(8, 19, 38, 0.82) 64%, rgba(8, 19, 38, 0.92) 100%)",
    boxShadow: "0 34px 90px rgba(0, 0, 0, 0.22)",
    display: "flex",
    alignItems: "flex-end",
  };
};

const flagStageStyle = (
  theme: FormatTheme,
  accentColor: string,
): React.CSSProperties => {
  return {
    flex: theme.format === "vertical" ? "0 0 auto" : "0 0 48%",
    minHeight: theme.format === "vertical" ? 390 : 0,
    padding: theme.format === "vertical" ? 28 : 36,
    borderRadius: 36,
    border: `1px solid ${PANEL_BORDER}`,
    background: `radial-gradient(circle at 18% 14%, ${withAlpha(
      accentColor,
      0.28,
    )} 0%, transparent 40%), linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, ${SURFACE} 100%)`,
    boxShadow: "0 34px 90px rgba(0, 0, 0, 0.22)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
};

const infoPanelStyle = (theme: FormatTheme): React.CSSProperties => {
  return {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: theme.format === "vertical" ? "flex-start" : "center",
    gap: 24,
    padding: theme.format === "vertical" ? 28 : 36,
    borderRadius: 36,
    border: `1px solid ${PANEL_BORDER}`,
    background: `linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, ${SURFACE} 100%)`,
    boxShadow: "0 34px 90px rgba(0, 0, 0, 0.22)",
  };
};

const qualificationPanelStyle = (theme: FormatTheme): React.CSSProperties => {
  return {
    display: "flex",
    flexDirection: "column",
    gap: theme.format === "vertical" ? 12 : 14,
    padding: theme.format === "vertical" ? "18px 16px" : "20px 18px",
    borderRadius: 24,
    border: `1px solid ${PANEL_BORDER}`,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    overflow: "hidden",
  };
};

const qualificationLabelStyle = (
  theme: FormatTheme,
  accentColor: string,
): React.CSSProperties => {
  return {
    color: accentColor,
    fontFamily: DISPLAY_FONT,
    fontSize: theme.microSize,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  };
};

const qualificationTableStyle = (theme: FormatTheme): React.CSSProperties => {
  return {
    display: "grid",
    alignItems: "stretch",
    overflow: "hidden",
    borderRadius: 16,
    border: "1px solid rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(2, 8, 20, 0.22)",
    fontFamily: BODY_FONT,
    fontSize: theme.format === "vertical" ? 18 : 20,
  };
};

const qualificationHeadingStyle = (theme: FormatTheme): React.CSSProperties => {
  return {
    padding: theme.format === "vertical" ? "8px 4px" : "10px 6px",
    borderRight: "1px solid rgba(255, 255, 255, 0.08)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    color: TEXT_MUTED,
    fontFamily: DISPLAY_FONT,
    fontSize: theme.format === "vertical" ? 15 : 17,
    letterSpacing: "0.04em",
    lineHeight: 1.1,
    textAlign: "center",
  };
};

const qualificationValueStyle = (theme: FormatTheme): React.CSSProperties => {
  return {
    padding: theme.format === "vertical" ? "9px 4px" : "11px 6px",
    borderRight: "1px solid rgba(255, 255, 255, 0.08)",
    color: TEXT_PRIMARY,
    fontFamily: DISPLAY_FONT,
    fontSize: theme.format === "vertical" ? 20 : 24,
    lineHeight: 1.1,
    textAlign: "center",
  };
};

const hostQualificationStyle = (
  theme: FormatTheme,
  accentColor: string,
): React.CSSProperties => {
  return {
    padding: theme.format === "vertical" ? "18px 20px" : "20px 22px",
    borderRadius: 24,
    border: `1px solid ${withAlpha(accentColor, 0.28)}`,
    backgroundColor: withAlpha(accentColor, 0.1),
    color: TEXT_PRIMARY,
    fontFamily: DISPLAY_FONT,
    fontSize: theme.format === "vertical" ? 28 : 34,
    lineHeight: 1.1,
    textTransform: "uppercase",
  };
};

const eyebrowStyle = (
  theme: FormatTheme,
  accentColor: string,
): React.CSSProperties => {
  return {
    display: "inline-flex",
    alignSelf: "flex-start",
    padding: theme.format === "vertical" ? "10px 14px" : "12px 16px",
    borderRadius: 999,
    backgroundColor: withAlpha(accentColor, 0.16),
    border: `1px solid ${withAlpha(accentColor, 0.32)}`,
    color: accentColor,
    fontFamily: DISPLAY_FONT,
    fontSize: theme.metaSize,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  };
};

const heroLabelStyle = (theme: FormatTheme): React.CSSProperties => {
  return {
    color: ACCENT_COLORS[0],
    fontFamily: DISPLAY_FONT,
    fontSize: theme.metaSize,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  };
};

const sectionHeaderStyle = (theme: FormatTheme): React.CSSProperties => {
  return {
    color: TEXT_PRIMARY,
    fontFamily: DISPLAY_FONT,
    fontSize: theme.format === "vertical" ? 34 : 42,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  };
};

const dividerStyle = (accentColor: string): React.CSSProperties => {
  return {
    width: "100%",
    height: 1,
    background: `linear-gradient(90deg, ${withAlpha(accentColor, 0.9)} 0%, rgba(255, 255, 255, 0.08) 100%)`,
  };
};

const stackStyle = (gap: number): React.CSSProperties => {
  return {
    display: "flex",
    flexDirection: "column",
    gap,
  };
};

const withAlpha = (hex: string, alpha: number) => {
  const normalized = hex.replace("#", "");
  const [r, g, b] =
    normalized.length === 3
      ? normalized.split("").map((part) => parseInt(`${part}${part}`, 16))
      : [
          parseInt(normalized.slice(0, 2), 16),
          parseInt(normalized.slice(2, 4), 16),
          parseInt(normalized.slice(4, 6), 16),
        ];

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const backgroundStyle: React.CSSProperties = {
  overflow: "hidden",
};

const DISPLAY_FONT = '"Arial Narrow", "Avenir Next Condensed", "Helvetica Neue", sans-serif';
const BODY_FONT = '"Avenir Next", "Segoe UI", sans-serif';
