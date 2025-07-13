"use client";

import React, { useEffect, useState } from "react";
import { getDefaultParameters, updateDefaultParameter} from "@/lib/param";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Save, Edit } from "lucide-react";
import { formatDateTimeMY } from "@/lib/utils";

interface Parameter {
  id: number;
  parameterName: string;
  parameterValue: string;
  updatedBy: string;
}

export function ParameterConfiguration() {
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingParameter, setEditingParameter] = useState<Parameter | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
  fetchParams();
}, []);

const fetchParams = async () => {
  try {
    const params = await getDefaultParameters();
    const transformed: Parameter[] = Object.entries(params).map(([key, value], index) => ({
      id: index,
      parameterName: key,
      parameterValue: value.toString(),
      updatedBy: "system",
    }));
    setParameters(transformed);
  } catch (err) {
    console.error("Failed to fetch default docking parameters", err);
  } finally {
    setLoading(false);
  }
};

  const handleEditParameter = (parameter: Parameter) => {
    setEditingParameter(parameter);
    setShowEditDialog(true);
  };

  const handleUpdateParameter = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingParameter) return;

    const formData = new FormData(e.currentTarget);
    const updatedValue = formData.get("parameterValue") as string;

    const updatedParams = parameters.map((p) =>
      p.id === editingParameter.id
        ? {
          ...p,
          parameterValue: updatedValue,
          updatedBy: "system", // or set to the current user if available
        }
        : p
    );

    setParameters(updatedParams);
    setEditingParameter(null);
    setShowEditDialog(false);

    const res = await updateDefaultParameter(editingParameter.parameterName, updatedValue);
    
    if (res.error)
      console.error("Failed to update parameter in DB", res.error);
    else
      
      await fetchParams(); // Refetch to ensure we have the latest data
  };

  const getParameterDisplayName = (name: string) => {
    const displayNames: { [key: string]: string } = {
      gridSizeX: "Grid Size X (Å)",
      gridSizeY: "Grid Size Y (Å)",
      gridSizeZ: "Grid Size Z (Å)",
      centerX: "Center X (Å)",
      centerY: "Center Y (Å)",
      centerZ: "Center Z (Å)",
      numModes: "Number of Modes",
      energyRange: "Energy Range (kcal/mol)",
      verbosity: "Verbosity Level",
      exhaustiveness: "Exhaustiveness",
      updatedBy: "Updated By",
      updatedAt: "Last Updated On",
    };
    return displayNames[name] || name;
  };

  if (loading) {
    return <div>Loading default parameters...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Default Parameter Configuration</CardTitle>
        <CardDescription>Configure default values for molecular docking parameters.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Parameter</TableHead>
              <TableHead>Current Value</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parameters
              .filter((param) => param.parameterName !== "id" && param.parameterName !== "updatedBy")
              .map((param) => (
              <TableRow key={param.id}>
                <TableCell className="font-medium">{getParameterDisplayName(param.parameterName)}</TableCell>
                <TableCell>
                {param.parameterName === "updatedAt"
                  ? formatDateTimeMY(new Date(param.parameterValue))
                  : param.parameterValue}
                </TableCell>
                <TableCell>
                {param.parameterName !== "updatedAt" && (
                  <Button variant="outline" size="sm" onClick={() => handleEditParameter(param)}>
                  <Edit className="h-4 w-4" />
                  </Button>
                )}
                </TableCell>
              </TableRow>
              ))}
          </TableBody>
        </Table>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Parameter</DialogTitle>
              <DialogDescription>
                Update the default value for{" "}
                {editingParameter && getParameterDisplayName(editingParameter.parameterName)}.
              </DialogDescription>
            </DialogHeader>

            {editingParameter && (
              <form onSubmit={handleUpdateParameter}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="parameterValue">Value</Label>
                    <Input
                      id="parameterValue"
                      name="parameterValue"
                      defaultValue={editingParameter.parameterValue}
                      required
                    />
                  </div>
                </div>
                <DialogFooter className="mt-4">
                  <Button type="submit">
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
