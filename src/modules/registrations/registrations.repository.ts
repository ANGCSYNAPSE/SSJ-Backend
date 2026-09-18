import { JsonFileRepository } from "../../db/JsonFileRepository";
import { Registration } from "./registrations.types";

export const registrationsRepository = new JsonFileRepository<Registration>("registrations");
