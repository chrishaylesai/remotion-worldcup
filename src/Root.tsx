import "./index.css";
import { CalculateMetadataFunction, Composition, Folder } from "remotion";
import {
  getGroupVideoData,
  getVideoDimensions,
  WORLD_CUP_FPS,
  WORLD_CUP_TOTAL_FRAMES,
  WorldCupGroupVideo,
  WorldCupGroupVideoProps,
  worldCupGroupVideoSchema,
} from "./world-cup";

const calculateMetadata: CalculateMetadataFunction<WorldCupGroupVideoProps> = ({
  props,
}) => {
  getGroupVideoData(props.groupId);

  return {
    fps: WORLD_CUP_FPS,
    durationInFrames: WORLD_CUP_TOTAL_FRAMES,
    ...getVideoDimensions(props.format),
  };
};

const defaultTemplateProps = {
  groupId: "group_a",
  format: "landscape",
} satisfies WorldCupGroupVideoProps;

export const RemotionRoot: React.FC = () => {
  return (
    <Folder name="WorldCupGroups">
      <Composition
        id="WorldCupGroupTemplate"
        component={WorldCupGroupVideo}
        durationInFrames={WORLD_CUP_TOTAL_FRAMES}
        fps={WORLD_CUP_FPS}
        width={1920}
        height={1080}
        schema={worldCupGroupVideoSchema}
        defaultProps={defaultTemplateProps}
        calculateMetadata={calculateMetadata}
      />
      <Composition
        id="WorldCupGroupLandscape"
        component={WorldCupGroupVideo}
        durationInFrames={WORLD_CUP_TOTAL_FRAMES}
        fps={WORLD_CUP_FPS}
        width={1920}
        height={1080}
        schema={worldCupGroupVideoSchema}
        defaultProps={{
          groupId: "group_a",
          format: "landscape",
        }}
        calculateMetadata={calculateMetadata}
      />
      <Composition
        id="WorldCupGroupVertical"
        component={WorldCupGroupVideo}
        durationInFrames={WORLD_CUP_TOTAL_FRAMES}
        fps={WORLD_CUP_FPS}
        width={1080}
        height={1920}
        schema={worldCupGroupVideoSchema}
        defaultProps={{
          groupId: "group_a",
          format: "vertical",
        }}
        calculateMetadata={calculateMetadata}
      />
    </Folder>
  );
};
