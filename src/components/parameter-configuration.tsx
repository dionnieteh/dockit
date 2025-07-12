"use client";

import React, { useEffect, useState } from "react";
import { getDefaultParameters } from "@/lib/get-default-param";
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

interface Parameter {
  id: number;
  parameterName: string;
  parameterValue: string;
  description: string;
  updatedBy: string;
  updatedAt: string;
}

export function ParameterConfiguration() {
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingParameter, setEditingParameter] = useState<Parameter | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    const fetchParams = async () => {
      try {
        const params = await getDefaultParameters();

        // Convert key-value object into array of editable Parameter objects
        const transformed: Parameter[] = Object.entries(params).map(([key, value], index) => ({
          id: index,
          parameterName: key,
          parameterValue: value.toString(),
          description: "", // Fill this from database if available
          updatedBy: "system",
          updatedAt: new Date().toISOString(),
        }));

        setParameters(transformed);
      } catch (err) {
        console.error("Failed to fetch default docking parameters", err);
      } finally {
        setLoading(false);
      }
    };

    fetchParams();
  }, []);

  const handleEditParameter = (parameter: Parameter) => {
    setEditingParameter(parameter);
    setShowEditDialog(true);
  };

  const handleUpdateParameter = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingParameter) return;

    const formData = new FormData(e.currentTarget);
    const updatedValue = formData.get("parameterValue") as string;
    const updatedDescription = formData.get("description") as string;

    const updatedParams = parameters.map((p) =>
      p.id === editingParameter.id
        ? {
            ...p,
            parameterValue: updatedValue,
            description: updatedDescription,
            updatedAt: new Date().toISOString(),
          }
        : p
    );

    setParameters(updatedParams);
    setEditingParameter(null);
    setShowEditDialog(false);

    // Optional: Persist changes to your DB
    try {
      await fetch(`/api/parameters/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parameterName: editingParameter.parameterName,
          parameterValue: updatedValue,
          description: updatedDescription,
        }),
      });
    } catch (err) {
      console.error("Failed to update parameter in DB", err);
    }
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
              <TableHead>Description</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parameters.map((param) => (
              <TableRow key={param.id}>
                <TableCell className="font-medium">{getParameterDisplayName(param.parameterName)}</TableCell>
                <TableCell>{param.parameterValue}</TableCell>
                <TableCell className="truncate max-w-xs">{param.description}</TableCell>
                <TableCell>{new Date(param.updatedAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => handleEditParameter(param)}>
                    <Edit className="h-4 w-4" />
                  </Button>
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
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      name="description"
                      defaultValue={editingParameter.description}
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
