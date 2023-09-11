import * as React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import mockedAxios from 'axios';

import RankList from '../Rank';
import core from 'kanji-app-core';

jest.useFakeTimers();

describe('Rank component', () => {
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

  it('Should display the ranking list', async () => {
    const response = {
      data: [
        {
          name: 'test-name',
          user_id: 'test-id',
          applications: {
            kanji: {
              total_score: 555,
            },
          },
        },
      ],
      status: 200,
      statusText: 'Ok',
      headers: {},
      config: {},
    };

    mockedAxios.get.mockResolvedValue(response);

    const { getByText } = render(<RankList type="kanji" />);

    await waitFor(() => {
      expect(getByText('test-name')).toBeDefined();
      expect(getByText('555')).toBeDefined();
    });
  });
});
