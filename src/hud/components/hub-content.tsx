import { KeyCap } from "./key-cap";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableRow } from "../ui/table";

export function HudContent() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="font-bold tracking-tight text-[#5a3f34]">Camera & Movement</div>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">HUD</Badge>
      </div>
      <Separator className="bg-[rgba(255,171,108,0.35)]" />

      <Table>
        <TableBody>
          <TableRow className="border-0">
            <TableCell className="p-0 align-middle text-[12px]">
              <div className="flex items-center gap-2">
                <KeyCap>W</KeyCap> / <KeyCap>S</KeyCap>
                <span className="text-[#5a4a45]">Move Forward/Backward</span>
              </div>
            </TableCell>
          </TableRow>
          <TableRow className="border-0">
            <TableCell className="p-0 align-middle text-[12px]">
              <div className="flex items-center gap-2">
                <KeyCap>A</KeyCap> / <KeyCap>D</KeyCap>
                <span className="text-[#5a4a45]">Move Left/Right</span>
              </div>
            </TableCell>
          </TableRow>
          <TableRow className="border-0">
            <TableCell className="p-0 align-middle text-[12px]">
              <div className="flex items-center gap-2">
                <KeyCap>Space</KeyCap> / <KeyCap>Shift</KeyCap>
                <span className="text-[#5a4a45]">Move Up/Down</span>
              </div>
            </TableCell>
          </TableRow>
          <TableRow className="border-0">
            <TableCell className="p-0 align-middle text-[12px]">
              <div className="flex items-center gap-2">
                <KeyCap>Left Mouse</KeyCap>
                <span className="text-[#5a4a45]">Orbit</span>
              </div>
            </TableCell>
          </TableRow>
          <TableRow className="border-0">
            <TableCell className="p-0 align-middle text-[12px]">
              <div className="flex items-center gap-2">
                <KeyCap>Right Mouse</KeyCap> / <KeyCap>Middle</KeyCap>
                <span className="text-[#5a4a45]">Pan</span>
              </div>
            </TableCell>
          </TableRow>
          <TableRow className="border-0">
            <TableCell className="p-0 align-middle text-[12px]">
              <div className="flex items-center gap-2">
                <KeyCap>Scroll</KeyCap>
                <span className="text-[#5a4a45]">Zoom</span>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <div className="mt-1 text-[11px] text-[#6a554c]">
        Press <KeyCap>H</KeyCap> to hide/show
      </div>
    </div>
  );
}
