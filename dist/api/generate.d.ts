interface VercelRequest {
    method: string;
    body: any;
}
interface VercelResponse {
    setHeader: (name: string, value: string) => void;
    status: (code: number) => VercelResponse;
    json: (data: any) => void;
    end: () => void;
}
export default function handler(req: VercelRequest, res: VercelResponse): Promise<void>;
export {};
//# sourceMappingURL=generate.d.ts.map