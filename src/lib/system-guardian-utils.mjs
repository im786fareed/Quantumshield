export function buildDuplicateGroups(files) {
  const grouped = new Map();

  for (const file of files) {
    const arr = grouped.get(file.fingerprint);
    if (arr) arr.push(file);
    else grouped.set(file.fingerprint, [file]);
  }

  return Array.from(grouped.entries())
    .map(([fingerprint, groupFiles]) => ({
      fingerprint,
      files: [...groupFiles].sort((a, b) => a.path.localeCompare(b.path)),
      potentialSavings:
        groupFiles.length > 1 ? (groupFiles.length - 1) * groupFiles[0].size : 0,
    }))
    .filter(group => group.files.length > 1)
    .sort((a, b) => b.potentialSavings - a.potentialSavings);
}

export function buildSuggestedSelection(groups) {
  const selection = new Set();
  for (const group of groups) {
    for (let i = 1; i < group.files.length; i += 1) {
      selection.add(group.files[i].id);
    }
  }
  return selection;
}

export function computeSelectedBytes(files, selectedIds) {
  return files.reduce(
    (sum, file) => sum + (selectedIds.has(file.id) ? file.size : 0),
    0
  );
}

export function partitionBySelection(files, selectedIds) {
  const toDelete = [];
  const remaining = [];
  for (const file of files) {
    if (selectedIds.has(file.id)) toDelete.push(file);
    else remaining.push(file);
  }
  return { toDelete, remaining };
}
