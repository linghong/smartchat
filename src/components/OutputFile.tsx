import { FC, Dispatch, SetStateAction } from 'react';
import AITextMessage from '@/src/components/AITextMessage';
import { ShowContentState } from '@/src/components/AITextMessageFileExtracted';

interface OutputFileProps {
  content: string;
  showContent: ShowContentState;
  setShowContent: Dispatch<SetStateAction<ShowContentState>>;
}

// Extract output file content
export const OutputFile: FC<OutputFileProps> = ({
  content,
  showContent,
  setShowContent
}) => {
  const outputFileRegex =
    /<outputfile title="([^"]+)">([\s\S]*?)<\/outputfile>/g;
  let outputFileMatch;
  const outputFileComponents = [];

  while ((outputFileMatch = outputFileRegex.exec(content)) !== null) {
    const [, title, fileContent] = outputFileMatch;

    outputFileComponents.push(
      <div key={title} className="output-file">
        <div
          onClick={() =>
            setShowContent({
              ...showContent,
              [title]: !showContent[title]
            })
          }
        >
          {title}
        </div>{' '}
        {/* Clickable title */}
        {showContent[title] && <AITextMessage content={fileContent} />}
      </div>
    );
  }

  return <div>{outputFileComponents}</div>;
};
