from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# Import SpendWise configuration
from app.core.config import settings

# Import Base
from app.db.base import Base

# Import models so Alembic can detect them
from app.models import User


# Alembic Config object
config = context.config

config.set_main_option("sqlalchemy.url",settings.DATABASE_URL)


# Configure Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)


# Metadata used for autogenerate
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode.

    This generates SQL without creating a database connection.
    """

    url = settings.DATABASE_URL

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={
            "paramstyle": "named"
        },
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Run migrations in 'online' mode.

    This connects to PostgreSQL and applies migrations.
    """

    configuration = config.get_section(
        config.config_ini_section,
        {}
    )

    # Load database URL from .env
    configuration["sqlalchemy.url"] = settings.DATABASE_URL

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:

        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()