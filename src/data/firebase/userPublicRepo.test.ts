import { beforeEach, describe, expect, it, vi } from 'vitest';
import { firebasePaths } from './paths';
import { userPublicRepo } from './userPublicRepo';

const readMock = vi.fn();
const writeMock = vi.fn();

vi.mock('./rtdb', () => ({
  rtdb: {
    read: (...args: unknown[]) => readMock(...args),
    write: (...args: unknown[]) => writeMock(...args),
  },
}));

describe('userPublicRepo', () => {
  beforeEach(() => {
    readMock.mockReset();
    writeMock.mockReset();
  });

  it('creates a public profile at the expected path', async () => {
    await userPublicRepo.createPublicProfile('uid-1', 'Test Runner');

    expect(writeMock).toHaveBeenCalledOnce();
    expect(writeMock.mock.calls[0]?.[0]).toBe(firebasePaths.userPublic('uid-1'));
    expect(writeMock.mock.calls[0]?.[1]).toMatchObject({
      displayName: 'Test Runner',
      avatarUrl: null,
      country: null,
    });
  });

  it('does not overwrite an existing profile on ensure', async () => {
    readMock.mockResolvedValueOnce({
      displayName: 'Existing',
      avatarUrl: null,
      country: null,
      createdAt: 1,
      updatedAt: 1,
    });

    await userPublicRepo.ensurePublicProfile('uid-1', 'New Name');

    expect(writeMock).not.toHaveBeenCalled();
  });

  it('creates profile on ensure when missing', async () => {
    readMock.mockResolvedValueOnce(null);

    await userPublicRepo.ensurePublicProfile('uid-1', 'Test Runner');

    expect(writeMock).toHaveBeenCalledOnce();
  });
});
