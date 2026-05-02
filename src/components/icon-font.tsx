import { createFromIconfontCN } from '@ant-design/icons';

console.log(import.meta.env.ICON_URL);


const IconFont = ({ type, style = null, className = null }) => {
  const IconFonts = createFromIconfontCN({
    scriptUrl: import.meta.env.VITE_ICON_URL,
  });
  return <IconFonts type={type} style={style} className={className} />;
};
export default IconFont;
