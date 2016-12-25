function sum(values) {
  return values
    .reduce((total, curr) =>
      total + curr,
      0
    );
}