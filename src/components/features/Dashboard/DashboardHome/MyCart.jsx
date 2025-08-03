import { Trash2, X } from "lucide-react";
import { useEffect } from "react";
import Modal from "react-modal";

export default function ShoppingCartModal({ onClose, isOpen }) {
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  // Set the app element for react-modal after component mounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      Modal.setAppElement("body");
    }
  }, []);

  const customStyles = {
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 50,
    },
    content: {
      position: "absolute",
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      background: "black",
      border: "1px solid rgba(255, 255, 255, 0.15)",
      borderRadius: "24px",
      padding: "32px",
      maxWidth: "600px",
      width: "100%",
      maxHeight: "90vh",
      overflow: "auto",
    },
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      style={customStyles}
      contentLabel="Shopping Cart"
      className="font-secondary"
    >
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors"
      >
        <X size={24} />
      </button>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-white text-2xl font-bold mb-4 tracking-wide">
          YOUR CART (02)
        </h1>
      </div>

      {/* Cart Items */}
      <div className="space-y-4 mb-8">
        {/* First Item - Detailed */}
        <div className="border border-cyan-400 rounded-xl p-4 bg-[#0e0e11]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-white">PREMIUM PLAN</h3>
              <p className="text-sm font-semibold text-white/80">$87.93</p>
            </div>
            <button className="text-gray-400 hover:text-white transition-colors">
              <Trash2 size={20} />
            </button>
          </div>

          <div className="text-sm h-[0.5px] bg-[#313131] my-2" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Service:</span>
              <span className="text-white">Digital Subscription Access</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Plan:</span>
              <span className="text-white">Premium</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Devices:</span>
              <span className="text-white">04</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Quantity:</span>
              <span className="text-white">02</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Adult Channels:</span>
              <span className="text-white">OFF</span>
            </div>
          </div>
        </div>

        {/* Second Item - Simple */}
        <div className="card_bg_border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">PREMIUM PLAN</h3>
              <p className="text-sm font-semibold text-white/80">$87.93</p>
            </div>
            <button className="text-gray-400 hover:text-white transition-colors">
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        {/* Third Item - Simple */}
        <div className="card_bg_border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">PREMIUM PLAN</h3>
              <p className="text-sm font-semibold text-white/80">$87.93</p>
            </div>
            <button className="text-gray-400 hover:text-white transition-colors">
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <div className="space-y-4">
        <button className="w-full bg-cyan-400 text-black py-4 rounded-full font-semibold text-sm hover:bg-cyan-300 transition-colors">
          Proceed To Checkout
        </button>
      </div>
    </Modal>
  );
}
