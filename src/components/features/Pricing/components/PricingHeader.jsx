const PricingHeader = ({ texts }) => {
  return (
    <h1 className="text-white text-sm sm:text-base md:text-lg px-2 sm:px-6 font-semibold mb-6 sm:mb-8 tracking-wide text-left">
      {texts.header}
    </h1>
  );
};

export default PricingHeader;
