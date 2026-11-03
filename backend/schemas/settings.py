from typing import Literal

from pydantic import BaseModel


class SiteSettings(BaseModel):
    """Site-wide switches. Defaults apply when a key has never been stored."""

    covers_enabled: bool = True


class PrintRequest(BaseModel):
    source_url: str
    invert: Literal["auto", "always", "never"] = "auto"


class PrintOutput(BaseModel):
    print_url: str
