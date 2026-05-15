# Integration Tests

Database-backed workflow tests should live here once the project has a dedicated test database setup.

Planned coverage:

- parent registration with persisted user records
- parent profile and child profile writes
- assessment request creation with notifications
- admin assessment scheduling and outcome recording
- plan acceptance and enrollment creation
- payment submission, approval, and enrollment activation

Do not place integration tests in `tests/unit`.
