import { getExportProps } from './getExportProps';

test('normal', () => {
  const props = getExportProps(
    `
const foo = () => {};
const bar = {};
foo.a = 1;
foo.b = '2';
foo.c = function() {};

foo.d = {
  aa: '1',
  bb: true,
  cc: {
    dd: 90
  },
  ee: [2],
  ff: null,
  gg: undefined,
  hh: () => {},
  jj() {}
};
foo.e = ['hh', { ff: 66 }, ['gg'], null, undefined, () => {}];

foo.f = true;
foo.g = false;
foo.i = null;
foo.j = undefined;
bar.h = true;
export default foo;
    `,
  );

  expect(props).toEqual(expect.any(Function));
  expect({ ...(props as Function) }).toEqual({
    a: 1,
    b: '2',
    c: expect.any(Function),
    d: {
      aa: '1',
      bb: true,
      cc: {
        dd: 90,
      },
      ee: [2],
      ff: null,
      gg: undefined,
      hh: expect.any(Function),
      jj: expect.any(Function),
    },
    e: ['hh', { ff: 66 }, ['gg'], null, undefined, expect.any(Function)],
    f: true,
    g: false,
    i: null,
    j: undefined,
  });
});

test('export an object directly', () => {
  const props = getExportProps(
    `
export default {
  a: {
    aa: 0,
    bb: '1',
    cc() {},
  },
  b: [0, '1', () => {}],
  c: () => {},
  d() {},
};
    `,
  );

  expect(props).toEqual({
    a: {
      aa: 0,
      bb: '1',
      cc: expect.any(Function),
    },
    b: [0, '1', expect.any(Function)],
    c: expect.any(Function),
    d: expect.any(Function),
  });
});

test('export an array directly', () => {
  const props = getExportProps(
    `
export default [null, 1, '2', () => {}, {a: true, b() {}}];
    `,
  );
  expect(props).toEqual([
    null,
    1,
    '2',
    expect.any(Function),
    { a: true, b: expect.any(Function) },
  ]);
});

test('export literal value', () => {
  expect(getExportProps('export default 0;')).toEqual(0);
  expect(getExportProps('export default "1";')).toEqual('1');
  expect(getExportProps('export default true;')).toEqual(true);
  expect(getExportProps('export default null;')).toEqual(null);
});

test('extract initial value', () => {
  const withoutInit = getExportProps('let a; export default a;');
  expect(withoutInit).toEqual(undefined);

  const literalValue = getExportProps('const a = true; export default a;');
  expect(literalValue).toEqual(true);

  const overridedValue = getExportProps('let a = 0; a = 1; export default a;');
  expect(overridedValue).toEqual(1);

  const overridedObject = getExportProps(`
let foo = { a: 0 };
foo = { a: 1 };
foo.b = 2;
export default foo;
  `);
  expect(overridedObject).toEqual({ a: 1, b: 2 });
});

test('cannot resolve', () => {
  expect(getExportProps('export default true ? 1 : 0;')).toEqual(undefined);
  expect(
    getExportProps(
      `
let a = true ? {} : {};
a = false ? {} : {};
export default a;
      `,
    ),
  ).toEqual(undefined);
  expect(
    getExportProps(
      `
const a = {};
a.b = true ? {} : {};
export default a;
      `,
    ),
  ).toEqual({});
});

test('no default export', () => {
  const props = getExportProps(
    `
export function foo () {}
    `,
  );
  expect(props).toEqual(undefined);
});