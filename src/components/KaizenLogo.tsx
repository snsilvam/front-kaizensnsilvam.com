type KaizenLogoProps = {
  className?: string;
  width?: number | string;
  height?: number | string;
  alt?: string;
};

export function KaizenLogo({
  className,
  width = '100%',
  height = 'auto',
  alt = 'Kaizen',
}: KaizenLogoProps) {
  return (
    <img
      src="/pastor-icon.png"
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  );
}

export default KaizenLogo;
