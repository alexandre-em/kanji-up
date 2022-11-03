import React, {useRef} from "react";
import AppNav from "../../components/AppNav";


export default function RecognitionList() {
  const mainDivRef: React.MutableRefObject<HTMLDivElement | undefined> = useRef();

  return (
    <div ref={mainDivRef as any}>
      <AppNav />
    </div>
  );
};
