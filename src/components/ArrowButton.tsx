import { FC } from 'react';

type ButtonProps = {
  disabled: boolean;
};

const ArrowButton: FC<ButtonProps> = ({ disabled = false }) => {
  return (
    <button
      type="submit"
      disabled={disabled}
      aria-label="Send message"
      className={`p-1 border-none opacity-60 hover:stone-600 disabled:cursor-not-allowed`}
    >
      <svg
        viewBox="0 0 18 18"
        className={`w-5 h-5 rotate-90 fill-current`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z">
          <title>Arrow Submit Button</title>
        </path>
      </svg>
    </button>
  );
};
export default ArrowButton;
