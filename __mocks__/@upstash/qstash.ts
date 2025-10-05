export const mockPublishJSON = jest.fn()

export const Client = jest.fn().mockImplementation(() => ({
  publishJSON: mockPublishJSON
}))
