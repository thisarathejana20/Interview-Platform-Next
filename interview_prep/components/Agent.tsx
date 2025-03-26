import Image from "next/image";
import React from "react";

const Agent = () => {
  return (
    <div className="call-view">
      <div className="card-interviewer">
        <div className="avatar">
          <Image
            src="/ai-avatar.png"
            alt="avatar"
            width={100}
            height={100}
            className="rounded-full"
          />
        </div>
      </div>
    </div>
  );
};

export default Agent;
