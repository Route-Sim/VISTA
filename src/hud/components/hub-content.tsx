import { KeyCap } from './key-cap';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableRow } from '../ui/table';

export function HudContent() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="font-bold tracking-tight text-black/80">
          Camera & Movement
        </div>
        <Badge variant="secondary" className="px-1.5 py-0.5 text-[10px]">
          HUD
        </Badge>
      </div>
      <Separator className="bg-black/10" />

      <Table>
        <TableBody>
          <TableRow className="border-0">
            <TableCell className="p-0 align-middle text-[12px]">
              <div className="flex items-center gap-2">
                <KeyCap>W</KeyCap> / <KeyCap>S</KeyCap>
                <span className="text-black/80">Move Forward/Backward</span>
              </div>
            </TableCell>
          </TableRow>
          <TableRow className="border-0">
            <TableCell className="p-0 align-middle text-[12px]">
              <div className="flex items-center gap-2">
                <KeyCap>A</KeyCap> / <KeyCap>D</KeyCap>
                <span className="text-black/80">Move Left/Right</span>
              </div>
            </TableCell>
          </TableRow>
          <TableRow className="border-0">
            <TableCell className="p-0 align-middle text-[12px]">
              <div className="flex items-center gap-2">
                <KeyCap>Space</KeyCap> / <KeyCap>Shift</KeyCap>
                <span className="text-black/80">Move Up/Down</span>
              </div>
            </TableCell>
          </TableRow>
          <TableRow className="border-0">
            <TableCell className="p-0 align-middle text-[12px]">
              <div className="flex items-center gap-2">
                <KeyCap>Left Mouse</KeyCap>
                <span className="text-black/80">Orbit</span>
              </div>
            </TableCell>
          </TableRow>
          <TableRow className="border-0">
            <TableCell className="p-0 align-middle text-[12px]">
              <div className="flex items-center gap-2">
                <KeyCap>Right Mouse</KeyCap> / <KeyCap>Middle</KeyCap>
                <span className="text-black/80">Pan</span>
              </div>
            </TableCell>
          </TableRow>
          <TableRow className="border-0">
            <TableCell className="p-0 align-middle text-[12px]">
              <div className="flex items-center gap-2">
                <KeyCap>Scroll</KeyCap>
                <span className="text-black/80">Zoom</span>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

        <div className="mt-1 text-[11px] text-black/80">
        Press <KeyCap>H</KeyCap> to hide/show
      </div>
    </div>
  );
}
