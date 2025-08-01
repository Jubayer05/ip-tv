import Polygon from "@/components/ui/polygon";

const ContactBanner = () => {
  return (
    <Polygon
      imageBg="/background/contact_bg.jpg"
      fullWidth={true}
      className="h-[550px]"
    >
      <div className="relative z-10 flex items-center justify-center px-6 h-polygon">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main heading */}
          <h1 className="text-white text-4xl md:text-[40px] font-bold mb-3 leading-tight">
            We’re Here to Help — Anytime, Anywhere <br />
          </h1>

          <p className="text-white text-sm font-medium mb-6 leading-tight font-secondary">
            Have questions, need help with your account, or want to report an
            issue? <br /> The Cheap Stream Support Team is available 24/7 to
            assist you.
          </p>
        </div>
      </div>
    </Polygon>
  );
};

export default ContactBanner;
