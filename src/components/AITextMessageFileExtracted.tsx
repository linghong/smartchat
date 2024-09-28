import { useState } from 'react';
import AITextMessage from '@/src/components/AITextMessage';

export type ShowContentState = {
  [key: string]: boolean;
};

// Extract output file content
export const AITextMessageFileExtracted = (content: string) => {
  const outputFileRegex =
    /<outputfile title="([^"]+)">([\s\S]*?)<\/outputfile>/g;
  let outputFileMatch;
  const outputFileComponents = [];
  let initialShowContent: ShowContentState = {};

  while ((outputFileMatch = outputFileRegex.exec(content)) !== null) {
    const [, title, fileContent] = outputFileMatch;
    initialShowContent[title] = false;
  }

  const [showContent, setShowContent] =
    useState<ShowContentState>(initialShowContent);

  const toggleContent = (title: string) => {
    setShowContent((prevState: ShowContentState) => ({
      ...prevState,
      [title]: !prevState[title]
    }));
  };

  // Remove outputfile tags from the original content and replace with clickable titles
  const contentWithoutOutputFiles = content.replace(
    outputFileRegex,
    (match, title) => {
      return `<div onClick="${toggleContent(title)}">${title}</div>`;
    }
  );

  return <AITextMessage content={contentWithoutOutputFiles} />;
};
