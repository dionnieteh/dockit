import { ToastVariant } from "@/hooks/use-toast"

export const TOAST = {
  UPDATE_SUCCESS: {
    title: "Information Updated Successfully",
    description: "Your changes have been saved.",
    variant: ToastVariant.SUCCESS,
  },
  UPDATE_ERROR: {
    title: "Information Failed to Update",
    description: "An error occured while updating data: ",
    variant: ToastVariant.ERROR,
  },
  GET_SUCCESS: {
    title: "Data Retrieved Successfully",
    description: "All data from database is displayed.",
    variant: ToastVariant.SUCCESS,
  },
  GET_ERROR: {
    title: "Data Failed to Fetch",
    description: "An error occurred while fetching data: ",
    variant: ToastVariant.ERROR,
  },
  DELETE_SUCCESS: {
    title: "Record Deleted Successfully",
    description: "The record has been removed from the database.",
    variant: ToastVariant.SUCCESS
  },
  DELETE_ERROR: {
    title: "Record Failed to Delete",
    description: "An error occurred while deleting the record: ",
    variant: ToastVariant.ERROR,
  },
  CREATE_SUCCESS: {
    title: "Record Created Successfully",
    description: "New record has been created in the database.",
    variant: ToastVariant.SUCCESS
  },
  CREATE_ERROR: {
    title: "Record Failed to Create",
    description: "An error occured while creating the record: ",
    variant: ToastVariant.ERROR
  },
  FILE_CREATE_SUCCESS: {
    title: "File Added Successfully",
    description: "New file has been added to the database.",
    variant: ToastVariant.SUCCESS
  },
  FILE_CREATE_ERROR: {
    title: "File Failed to Add",
    description: "An error occured while adding the file: ",
    variant: ToastVariant.ERROR
  },
  DEFAULT_SUCCESS: {
    title: "Operation Successful",
    description: "Operation completed successfully.",
    variant: ToastVariant.SUCCESS
  },
  DEFAULT_ERROR: {
    title: "Operation Failed",
    description: "An error occurred while processing your request.",
    variant: ToastVariant.ERROR
  },
  STATS_SUCCESS: {
    title: "Statistics Retrieved Successfully",
    description: "All statistics have been fetched.",
    variant: ToastVariant.SUCCESS
  },
  STATS_ERROR: {
    title: "Statistics Failed to Fetch",
    description: "An error occurred while fetching statistics: ",
    variant: ToastVariant.ERROR,
  },
  DOCKING_PROCESS_SUCCESS: {
    title: "Docking Job Completed Successfully",
    description: "Your docking job has been completed.",
    variant: ToastVariant.SUCCESS,
  },
  DOCKING_PROCESS_ERROR: {
    title: "Docking Job Failed",
    description: "An error occurred during the docking process: ",
    variant: ToastVariant.ERROR,
  },
  PARAM_UPDATE_SUCCESS: {
    title: "Parameter Updated Successfully",
    description: "The docking parameter has been updated.",
    variant: ToastVariant.SUCCESS,
  },
  PARAM_UPDATE_ERROR: {
    title: "Parameter Update Failed",
    description: "An error occurred while updating the docking parameter: ",
    variant: ToastVariant.ERROR,
  },
} as const