import apiClient from '@/services/api';
import type {
  AIMoveRequest,
  AIMoveResponse,
  AIHintRequest,
  AIHintResponse,
  AIValidateRequest,
  AIValidateResponse,
} from '@/types/ai';

export const aiService = {
  /**
   * Tính toán nước đi tốt nhất từ AI engine
   */
  async getAIMove(data: AIMoveRequest): Promise<AIMoveResponse> {
    const response = await apiClient.post<AIMoveResponse>('/engine/move', data);
    return response.data;
  },

  /**
   * Nhận gợi ý nước đi tối ưu từ AI engine
   */
  async getAIHint(data: AIHintRequest): Promise<AIHintResponse> {
    const response = await apiClient.post<AIHintResponse>('/engine/hint', data);
    return response.data;
  },

  /**
   * Kiểm tra nước đi hợp lệ
   */
  async validateMove(data: AIValidateRequest): Promise<AIValidateResponse> {
    const response = await apiClient.post<AIValidateResponse>('/engine/validate', data);
    return response.data;
  },
};

export default aiService;
