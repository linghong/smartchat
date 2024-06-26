import { FC, ReactNode } from 'react';

interface FieldSetProp {
  children: ReactNode;
}

const FieldSet: FC<FieldSetProp> = ({ children }) => {
  return (
    <div className="flex flex-col my-3 py-4 px-6 bg-slate-50 border border-indigo-100 shadow-md rounded">
      {children}
    </div>
  );
};
export default FieldSet;
