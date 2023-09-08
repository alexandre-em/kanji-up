import core, { Core } from 'kanji-app-core';
import mockedAxios from 'axios';

describe('user', () => {
  beforeAll(() => {
    core.init(
      {
        user: 'https://user-endpoint.kanji-up.app',
        kanji: 'https://kanji-endpoint.kanji-up.app',
        recognition: 'https://recognition-endpoint.kanji-up.app',
      },
      'access_token'
    );
  });

  it('Should get user profile', async () => {
    const response = {
      data: {
        name: 'user',
        email: 'email.me@kanji.app',
        created_at: '2022-11-16T21:34:18.787Z',
        user_id: 'user_id',
        deleted_at: null,
      },
      status: 200,
      statusText: 'Ok',
      headers: {},
      config: {},
    };

    mockedAxios.get.mockResolvedValue(response);

    const result = await core.userService?.getProfile();

    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(result).toBe(response);
  });

  it('Should throw instance not created error', () => {
    const newCore = new Core();

    const calls = mockedAxios.get.mock.calls;

    expect(async () => {
      await newCore.userService?.getProfile();
    }).rejects.toThrow('User instance not ready...');
    // Get function not reached and error thrown is not related to the axios get call
    expect(mockedAxios.get).toHaveBeenCalledTimes(calls.length);
  });
});
