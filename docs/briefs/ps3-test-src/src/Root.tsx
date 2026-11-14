import React from "react";
import { Composition } from "remotion";
import { PS3Test } from "./PS3Test";
export const Root: React.FC = () => (
  <Composition id="PS3Test" component={PS3Test} width={1080} height={1920} fps={30} durationInFrames={300} />
);
