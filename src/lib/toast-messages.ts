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

} as const