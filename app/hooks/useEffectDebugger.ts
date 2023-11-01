import React from "react";
import { useRef } from "react";

const usePrevious = (value: any, initialValue: any) => {
  const ref = useRef(initialValue);
  React.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

const useEffectDebugger = (effectHook: any, dependencies: any, dependencyNames: string[] = []) => {
  const previousDeps = usePrevious(dependencies, []);

  const changedDeps = dependencies.reduce((accum: any, dependency: any, index: any) => {
    if (dependency !== previousDeps[index]) {
      const keyName = dependencyNames[index] || index;
      return {
        ...accum,
        [keyName]: {
          before: previousDeps[index],
          after: dependency,
        },
      };
    }

    return accum;
  }, {});

  if (Object.keys(changedDeps).length) {
    console.log("🐛 [use-effect-debugger] ", changedDeps);
  }

  React.useEffect(effectHook, [effectHook, ...dependencies]);
};

export default useEffectDebugger;
