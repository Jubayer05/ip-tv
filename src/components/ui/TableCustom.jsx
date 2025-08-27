"use client";
import { Table } from "antd";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import Button from "./button";

const TableCustom = ({
  title = "Table",
  data = [],
  columns = [],
  pageSize = 5,
  autoplay = true,
  showButton = true,
  onButtonClick,
  onItemClick,
  className = "",
  containerClassName = "",
  autoPlayDuration = 3000,
  icon = "",
  buttonText = "Get More",
  cardType = "default", // "default", "movie", "show", "channel", "detailed"
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setCurrentPageSize(size);
  };

  return (
    <div
      className={` bg-black rounded-[15px] w-full max-w-5xl mx-auto font-secondary ${containerClassName}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          {icon && (
            <Image
              src={icon}
              alt={title}
              width={30}
              height={30}
              className="w-7 h-7"
            />
          )}
          <h2 className="text-base sm:text-2xl md:text-3xl font-bold tracking-wider uppercase">
            {title}
          </h2>
        </div>
        {showButton && (
          <Button
            className="bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-gray-200 transition-all flex items-center gap-2"
            onClick={onButtonClick}
          >
            {buttonText} <ArrowRight />
          </Button>
        )}
      </div>

      {/* Antd Table with Built-in Pagination */}
      <div
        className={`custom-antd-table border border-[#374151] rounded-[8px] ${className}`}
      >
        <Table
          columns={columns}
          dataSource={data}
          pagination={{
            current: currentPage,
            pageSize: currentPageSize,
            total: data.length,
            onChange: handlePageChange,
            showSizeChanger: false,
            className: "custom-pagination",
            showTotal: (total, range) =>
              `Showing ${range[1] - range[0] + 1} from ${range[0]}-${
                range[1]
              } `,
          }}
          className="custom-table"
          scroll={{ x: "max-content" }}
        />
      </div>

      {/* Custom Styles for Antd Table */}
      <style jsx global>{`
        .custom-antd-table .ant-table {
          background: transparent !important;
          color: white !important;
        }

        .custom-antd-table .ant-table-thead > tr > th:first-child::before {
          border-top-left-radius: 15px !important;
          border-bottom-left-radius: 15px !important;
        }

        /* Override antd's default column separator */
        .custom-antd-table
          .ant-table-thead
          > tr
          > th:not(:last-child):not(.ant-table-selection-column):not(
            .ant-table-row-expand-icon-cell
          ):not([colspan])::before,
        .custom-antd-table
          .ant-table-thead
          > tr
          > td:not(:last-child):not(.ant-table-selection-column):not(
            .ant-table-row-expand-icon-cell
          ):not([colspan])::before {
          width: 0 !important;
        }

        .custom-pagination > li {
          margin-right: 20px !important;
        }

        .custom-antd-table .ant-table-thead > tr > th {
          background: rgba(255, 255, 255, 0.1) !important;
          border-bottom: 1px solid #374151 !important;
          border-right: none !important;
          color: #9ca3af !important;
          font-weight: 500 !important;
          font-size: 14px !important;
          padding-bottom: 16px !important;
          font-family: inherit !important;
        }

        /* Center align specific header columns */
        .custom-antd-table .ant-table-thead > tr > th:nth-child(2),
        .custom-antd-table .ant-table-thead > tr > th:nth-child(3),
        .custom-antd-table .ant-table-thead > tr > th:nth-child(4) {
          text-align: center !important;
        }

        /* Center align specific body columns */
        .custom-antd-table .ant-table-tbody > tr > td:nth-child(2),
        .custom-antd-table .ant-table-tbody > tr > td:nth-child(3),
        .custom-antd-table .ant-table-tbody > tr > td:nth-child(4) {
          text-align: center !important;
        }

        .custom-antd-table .ant-table-tbody > tr > td {
          background: transparent !important;
          border-bottom: 1px solid #1f2937 !important;
          border-right: none !important;
          padding: 24px 0 !important;
          font-family: inherit !important;
        }

        .custom-antd-table .ant-table-tbody > tr:last-child > td {
          border-bottom: none !important;
        }

        .custom-antd-table .ant-table-tbody > tr:hover > td {
          background: rgba(255, 255, 255, 0.05) !important;
        }

        /* Antd Pagination Styles */
        .custom-antd-table .ant-pagination {
          margin-top: 16px !important;
          text-align: left !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          gap: 8px !important;
          flex-wrap: wrap !important;
        }

        /* More specific pagination styles */
        .custom-antd-table .ant-pagination .ant-pagination-item {
          background: transparent !important;
          border: none !important;
          color: #9ca3af !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          margin: 0 !important;
          min-width: 28px !important;
          height: 28px !important;
          border-radius: 6px !important;
        }

        .custom-antd-table .ant-pagination .ant-pagination-item a {
          color: inherit !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 100% !important;
          height: 100% !important;
          line-height: 28px !important;
          text-align: center !important;
          border-radius: 6px !important;
          font-size: 12px !important;
        }

        .custom-antd-table .ant-pagination .ant-pagination-item:hover {
          color: #ffffff !important;
        }

        .custom-antd-table .ant-pagination .ant-pagination-item-active {
          background: #3b82f6 !important;
          color: #ffffff !important;
        }

        .custom-antd-table .ant-pagination .ant-pagination-item-active a {
          color: #ffffff !important;
        }

        .custom-antd-table .ant-pagination .ant-pagination-prev,
        .custom-antd-table .ant-pagination .ant-pagination-next {
          color: #9ca3af !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          min-width: 28px !important;
          height: 28px !important;
          border-radius: 6px !important;
          margin: 0 2px !important;
        }

        .custom-antd-table .ant-pagination .ant-pagination-prev:hover,
        .custom-antd-table .ant-pagination .ant-pagination-next:hover {
          color: #ffffff !important;
        }

        .custom-antd-table
          .ant-pagination
          .ant-pagination-prev
          .ant-pagination-item-link,
        .custom-antd-table
          .ant-pagination
          .ant-pagination-next
          .ant-pagination-item-link {
          background: transparent !important;
          border: none !important;
          color: inherit !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 100% !important;
          height: 100% !important;
          font-size: 12px !important;
        }

        .custom-antd-table
          .ant-pagination
          .ant-pagination-prev:hover
          .ant-pagination-item-link,
        .custom-antd-table
          .ant-pagination
          .ant-pagination-next:hover
          .ant-pagination-item-link {
          color: #ffffff !important;
        }

        .custom-antd-table .ant-pagination .ant-pagination-total-text {
          color: #6b7280 !important;
          font-size: 12px !important;
          margin: 0 8px !important;
          flex: 1 !important;
        }

        /* Ensure all pagination items are visible */
        .custom-antd-table .ant-pagination .ant-pagination-item,
        .custom-antd-table .ant-pagination .ant-pagination-prev,
        .custom-antd-table .ant-pagination .ant-pagination-next {
          opacity: 1 !important;
          visibility: visible !important;
        }

        /* Fix pagination item display */
        .custom-antd-table .ant-pagination .ant-pagination-item a {
          color: inherit !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 100% !important;
          height: 100% !important;
          border-radius: 6px !important;
        }

        .custom-antd-table .ant-pagination .ant-pagination-item-active a {
          background: #3b82f6 !important;
          color: #ffffff !important;
        }

        /* Mobile specific pagination adjustments */
        @media (max-width: 768px) {
          .custom-antd-table .ant-pagination {
            gap: 2px !important;
            justify-content: space-between !important;
            flex-direction: row !important;
            align-items: center !important;
          }

          .custom-antd-table .ant-pagination .ant-pagination-item,
          .custom-antd-table .ant-pagination .ant-pagination-prev,
          .custom-antd-table .ant-pagination .ant-pagination-next {
            min-width: 24px !important;
            height: 24px !important;
            margin: 0 1px !important;
          }

          .custom-antd-table .ant-pagination .ant-pagination-item a {
            line-height: 24px !important;
            font-size: 11px !important;
          }

          .custom-antd-table .ant-pagination .ant-pagination-total-text {
            font-size: 11px !important;
            margin-right: 4px !important;
          }

          .custom-antd-table
            .ant-pagination
            .ant-pagination-prev
            .ant-pagination-item-link,
          .custom-antd-table
            .ant-pagination
            .ant-pagination-next
            .ant-pagination-item-link {
            font-size: 11px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TableCustom;
