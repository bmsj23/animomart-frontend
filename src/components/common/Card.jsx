const Card = ({
  children,
  className = '',
  hoverable = false,
  onClick,
  ...props
}) => {
  const hoverClass = hoverable ? 'hover:shadow-lg transition-shadow duration-200 cursor-pointer' : '';

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-md ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
