enum WordPermissions {
  ADD_WORD = 'add:word',
  REMOVE_WORD = 'remove:word',
  UPDATE_WORD = 'update:word',
}

enum SentencePermissions {
  ADD_SENTENCE = 'add:sentence',
  REMOVE_SENTENCE = 'remove:sentence',
  UPDATE_SENTENCE = 'update:sentence',
}

const Permission = { ...WordPermissions, ...SentencePermissions };

type Permission = WordPermissions | SentencePermissions;

export default Permission;
