import { useState } from "react";
import { FiDownload, FiEye, FiFileText, FiTrash2 } from "react-icons/fi";
import { deleteDocumentation } from "../lib/documentation-service";
import type { Documentation } from "../lib/documentation-service";

interface DocumentationItemProps {
  doc: Documentation;
  onDelete?: (id: number) => void;
}

export const DocumentationItem: React.FC<DocumentationItemProps> = ({
  doc,
  onDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!doc.id || isDeleting) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${doc.name}"?`
    );

    if (confirmed) {
      setIsDeleting(true);
      try {
        const success = await deleteDocumentation(doc.id);
        if (success && onDelete) {
          onDelete(doc.id);
        } else {
          alert("Failed to delete the document. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting document:", error);
        alert("An error occurred while deleting the document.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Get file extension to determine icon
  const fileExt = doc.file_url?.split(".").pop()?.toLowerCase() || "";
  const isPDF = fileExt === "pdf";

  return (
    <div className="flex items-center justify-between p-3 bg-white border rounded-md shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="text-primary p-2 bg-primary/10 rounded-md">
          <FiFileText size={24} />
        </div>
        <div>
          <h4 className="font-medium text-gray-800">{doc.name}</h4>
          <p className="text-xs text-gray-500">
            {new Date(doc.created_at || "").toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex space-x-2">
        {isPDF && doc.file_url && (
          <a
            href={doc.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            title="View"
          >
            <FiEye size={18} />
          </a>
        )}

        {doc.file_url && (
          <a
            href={doc.file_url}
            download
            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
            title="Download"
          >
            <FiDownload size={18} />
          </a>
        )}

        {onDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`p-2 rounded-full transition-colors ${
              isDeleting
                ? "text-gray-400 bg-gray-100"
                : "text-gray-500 hover:text-red-600 hover:bg-red-50"
            }`}
            title="Delete"
          >
            <FiTrash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

interface DocumentationListProps {
  documents: Documentation[];
  onDelete?: (id: number) => void;
  emptyMessage?: string;
}

export default function DocumentationList({
  documents,
  onDelete,
  emptyMessage = "No documentation files available",
}: DocumentationListProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 border border-dashed border-gray-300 rounded-md">
        <FiFileText className="mx-auto text-gray-400 mb-2" size={24} />
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <DocumentationItem key={doc.id} doc={doc} onDelete={onDelete} />
      ))}
    </div>
  );
}
