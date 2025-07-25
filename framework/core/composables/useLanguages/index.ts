import { inject, provide } from "vue";
import { LanguageServiceKey } from "../../../injection-keys";
import { ILanguageService, createLanguageService } from "../../services/language-service";

export interface IUseLanguages extends ILanguageService {}

export function provideLanguages(): ILanguageService {
  const service = createLanguageService();
  provide(LanguageServiceKey, service);
  return service;
}

export function useLanguages(): IUseLanguages {
  let languageService = inject(LanguageServiceKey);

  if (!languageService) {
    languageService = provideLanguages();
    // throw new Error("Language service not found. Make sure the framework is properly initialized.");
  }

  return languageService;
}
