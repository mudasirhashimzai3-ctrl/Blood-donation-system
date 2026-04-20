from __future__ import annotations


def patch_django_context_copy() -> None:
    """
    Patch Django's BaseContext.__copy__ to work correctly on Python 3.14+.

    Django 5.0.2's implementation uses copy(super()) which returns a 'super'
    proxy and breaks attribute assignment. We replace it with a safe
    __new__-based copy to avoid calling __init__ (important for RequestContext).
    """
    from django.template.context import BaseContext

    if getattr(BaseContext.__copy__, "__name__", "") == "_basecontext_copy":
        return

    def _basecontext_copy(self):
        duplicate = self.__class__.__new__(self.__class__)
        if hasattr(self, "__dict__"):
            duplicate.__dict__ = self.__dict__.copy()
        duplicate.dicts = self.dicts[:]
        return duplicate

    BaseContext.__copy__ = _basecontext_copy
