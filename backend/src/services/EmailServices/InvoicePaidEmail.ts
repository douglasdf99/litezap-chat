import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

export class InvoicePaidEmail {
  private readTemplateFile(templateName: string): string {
    try {
      const filePath = path.join(__dirname, `../../templates/emails/${templateName}.hbs`);
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      throw new Error('Error reading email template file: ' + error.message);
    }
  }

  public compileTemplate(data: { name: string; [key: string]: any }): string {
    const templateContent = this.readTemplateFile('invoicePaidTemplate');
    const template = Handlebars.compile(templateContent);
    return template(data);
  }
}
