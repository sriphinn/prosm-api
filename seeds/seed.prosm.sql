BEGIN;

TRUNCATE
  prosm_users,
  prosm_posts
  RESTART IDENTITY CASCADE;

INSERT INTO prosm_users (first_name, last_name, email, password)
VALUES
  (
    'Phinn',
    'Sriployrung',
    'psrip001@gmail.com',
    'phinn'
  ),
  (
    'Mario',
    'Mol',
    'mario@gmail.com',
    'mario'
  ),
  (
    'Sally',
    'Thinkful',
    'sally@gmail.com',
    'sally'
  );

INSERT INTO prosm_posts (title, modified, user_id, content)
VALUES
  (
    'Dogs',
    '2019-01-03T00:00:00.000Z',
    '1',
    'Corporis accusamus placeat quas non voluptas.'
  ),
  (
    'Cats',
    '2018-08-15T23:00:00.000Z',
    '2',
    'Eos laudantium quia ab blanditiis temporibus necessitatibus.'
  ),
  (
    'Pigs',
    '2018-03-01T00:00:00.000Z',
    '3',
    'Occaecati dignissimos quam qui facere deserunt quia.'
  ),
  (
    'Birds',
    '2019-01-04T00:00:00.000Z',
    '3',
    'Eum culpa odit. Veniam porro molestiae dolores sunt reiciendis culpa.'
  ),
  (
    'Wolves',
    '2018-05-16T23:00:00.000Z',
    '2',
    'Expedita mollitia et. Voluptates optio expedita.'
  ),
  (
   'Elephants',
    '2018-04-11T23:00:00.000Z',
    '1',
    'Rem enim voluptatem autem fuga possimus.'
  );

COMMIT;

