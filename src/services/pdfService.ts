import apiClient from "./apiClient";

export const pdfService = {
  // Download  month PDF
  downloadMonthPDF: async (monthId: string): Promise<Blob> => {
    const { data } = await apiClient.get(`/pdf/month/${monthId}`, {
      responseType: "blob",
    });
    return data;
  },

  // Download member statement PDF
  downloadMemberStatementPDF: async (
    memberId: string,
    monthId: string,
  ): Promise<Blob> => {
    const { data } = await apiClient.get(
      `/pdf/member-statement/${memberId}/${monthId}`,
      {
        responseType: "blob",
      },
    );
    return data;
  },

  // Trigger PDF download
  triggerDownload: (blob: Blob, filename: string): void => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};
